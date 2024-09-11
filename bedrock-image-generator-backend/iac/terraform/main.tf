provider "aws" {
  region = var.region_name
}

resource "random_uuid" "random" {
}

resource "aws_s3_bucket" "images_bucket" {
  bucket = "bedrock-images-${random_uuid.random.result}"

  tags = var.tags
}

resource "aws_s3_bucket_cors_configuration" "images_bucket_cors" {
  bucket = aws_s3_bucket.images_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "POST"]
    allowed_origins = ["*"]
    expose_headers = [
      "x-amz-server-side-encryption",
      "x-amz-request-id",
      "x-amz-id-2"
    ]
    max_age_seconds = 3000
  }
}

data "archive_file" "zip_the_python_code" {
  type        = "zip"
  source_dir  = var.function_filepath
  output_path = "${var.function_filepath}/index.zip"
}

resource "aws_lambda_function" "image_generator_lambda" {
  description   = "Lambda function for the bedrock image generator"
  filename      = "${var.function_filepath}/index.zip"
  function_name = "image_generator_lambda"
  runtime       = "python3.12"
  handler       = "index.lambda_handler"
  timeout       = 90
  role          = aws_iam_role.image_generator_lambda_role.arn
  depends_on    = [aws_iam_role_policy_attachment.lambda_exec_attachment]

  environment {
    variables = {
      IMAGE_STORAGE_BUCKET = aws_s3_bucket.images_bucket.bucket
      REGION_NAME          = var.region_name
    }
  }

  tags = var.tags
}

resource "aws_iam_role" "image_generator_lambda_role" {
  name = "image_generator_lambda_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_policy" "image_generator_lambda_policy" {
  description = "AWS IAM Policy for managing aws lambda role"
  name        = "image_generator_lambda_policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject"
        ]
        Resource = [
          aws_s3_bucket.images_bucket.arn,
          "${aws_s3_bucket.images_bucket.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel"
        ]
        Resource = "*"
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "lambda_exec_attachment" {
  role       = aws_iam_role.image_generator_lambda_role.name
  policy_arn = aws_iam_policy.image_generator_lambda_policy.arn
}

resource "aws_api_gateway_rest_api" "image_generator_gateway_api" {
  description = "API Gateway for the bedrock image generator"
  name        = "image-api-gateway"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = var.tags
}

resource "aws_api_gateway_resource" "image_resource" {
  rest_api_id = aws_api_gateway_rest_api.image_generator_gateway_api.id
  parent_id   = aws_api_gateway_rest_api.image_generator_gateway_api.root_resource_id
  path_part   = "image-generator"
}

resource "aws_api_gateway_method" "gateway_post_method" {
  rest_api_id   = aws_api_gateway_rest_api.image_generator_gateway_api.id
  resource_id   = aws_api_gateway_resource.image_resource.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda_integration_post" {
  rest_api_id             = aws_api_gateway_rest_api.image_generator_gateway_api.id
  resource_id             = aws_api_gateway_resource.image_resource.id
  http_method             = aws_api_gateway_method.gateway_post_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.image_generator_lambda.invoke_arn
}

resource "aws_api_gateway_method_response" "post_method_response_200" {
  rest_api_id = aws_api_gateway_rest_api.image_generator_gateway_api.id
  resource_id = aws_api_gateway_resource.image_resource.id
  http_method = aws_api_gateway_method.gateway_post_method.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_method" "gateway_options_method" {
  rest_api_id   = aws_api_gateway_rest_api.image_generator_gateway_api.id
  resource_id   = aws_api_gateway_resource.image_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda_integration_options" {
  rest_api_id          = aws_api_gateway_rest_api.image_generator_gateway_api.id
  resource_id          = aws_api_gateway_resource.image_resource.id
  http_method          = aws_api_gateway_method.gateway_options_method.http_method
  cache_key_parameters = []
  type                 = "MOCK"
  request_parameters   = {}
  request_templates = {
    "application/json" = jsonencode(
      {
        statusCode = 200
      }
    )
  }
}

resource "aws_api_gateway_integration_response" "options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.image_generator_gateway_api.id
  resource_id = aws_api_gateway_resource.image_resource.id
  http_method = aws_api_gateway_method.gateway_options_method.http_method
  status_code = aws_api_gateway_method_response.options_method_response_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
    "method.response.header.Access-Control-Allow-Methods" = "'OPTIONS'",
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  depends_on = [
    aws_api_gateway_method.gateway_options_method,
    aws_api_gateway_integration.lambda_integration_options
  ]
}

resource "aws_api_gateway_method_response" "options_method_response_200" {
  rest_api_id = aws_api_gateway_rest_api.image_generator_gateway_api.id
  resource_id = aws_api_gateway_resource.image_resource.id
  http_method = aws_api_gateway_method.gateway_options_method.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
    "method.response.header.Access-Control-Allow-Origin"  = false
  }
  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_lambda_permission" "api_gateway_permission_options" {
  statement_id  = "allow_api_gateway_options_invoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.image_generator_lambda.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.image_generator_gateway_api.execution_arn}/*/OPTIONS/${aws_api_gateway_resource.image_resource.path_part}"
}

resource "aws_lambda_permission" "api_gateway_permission_post" {
  statement_id  = "allow_api_gateway_post_invoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.image_generator_lambda.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.image_generator_gateway_api.execution_arn}/*/POST/${aws_api_gateway_resource.image_resource.path_part}"
}

resource "aws_api_gateway_deployment" "api_gateway_deployment" {
  depends_on = [
    aws_api_gateway_integration.lambda_integration_post,
    aws_api_gateway_integration.lambda_integration_options
  ]

  rest_api_id = aws_api_gateway_rest_api.image_generator_gateway_api.id
  stage_name  = var.stage_name
}
