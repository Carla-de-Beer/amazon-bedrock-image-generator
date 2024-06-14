from aws_cdk import (
    aws_lambda,
    aws_apigateway,
    aws_iam,
    aws_s3,
    Duration,
    Stack
)
from constructs import Construct


class CdkStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        images_bucket = aws_s3.Bucket(
            self,
            "images-bucket",
            cors=[
                aws_s3.CorsRule(
                    allowed_headers=["*"],
                    allowed_methods=[aws_s3.HttpMethods.GET],
                    allowed_origins=["*"],
                    max_age=3000
                )
            ]
        )

        images_lambda = aws_lambda.Function(
            self,
            "images-lambda",
            runtime=aws_lambda.Runtime.PYTHON_3_12,
            code=aws_lambda.Code.from_asset("../../lambda-function"),
            handler="index.lambda_handler",
            timeout=Duration.seconds(90),
            environment={
                "IMAGE_STORAGE_BUCKET": images_bucket.bucket_name,
                "REGION_NAME": "us-east-1"
            }
        )

        images_bucket.grant_read_write(images_lambda)

        images_lambda.add_to_role_policy(
            aws_iam.PolicyStatement(
                effect=aws_iam.Effect.ALLOW,
                resources=["*"],
                actions=["bedrock:InvokeModel"]
            )
        )

        image_api = aws_apigateway.RestApi(
            self,
            "image-api-gateway",
            default_cors_preflight_options=aws_apigateway.CorsOptions(
                allow_origins=aws_apigateway.Cors.ALL_ORIGINS,
                allow_methods=["OPTIONS", "POST"],
                allow_headers=["Content-Type"]
            )
        )

        image_resource = image_api.root.add_resource("image-generator")
        image_integration = aws_apigateway.LambdaIntegration(images_lambda, proxy=True)

        image_resource.add_method(
            "POST",
            image_integration,
            method_responses=[
                aws_apigateway.MethodResponse(
                    status_code="200",
                    response_parameters={
                        "method.response.header.Access-Control-Allow-Headers": True,
                        "method.response.header.Access-Control-Allow-Methods": True,
                        "method.response.header.Access-Control-Allow-Origin": True
                    }
                )
            ]
        )
