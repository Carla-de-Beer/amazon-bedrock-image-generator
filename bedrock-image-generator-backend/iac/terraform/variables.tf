variable "region_name" {
  description = "AWS Region"
  type        = string
  default     = "us-east-1"
}

variable "stage_name" {
  description = "API Gateway stage"
  type        = string
  default     = "dev"
}

variable "tags" {
  description = "Tags to be applied to the resources"
  type        = map(string)
  default = {
    Terraform = "true"
    Project   = "Bedrock image generator"
  }
}

variable "function_filepath" {
  description = "Filepath to the aws lambda function"
  type        = string
  default     = "../../lambda-function"
}
