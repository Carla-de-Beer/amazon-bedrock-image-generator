terraform {
  required_version = ">= 1.8.5"

  backend "local" {
    path = "backend/terraform.tfstate"
  }

  #   backend "s3" {
  #     bucket = "ADD_BUCKET_NAME_HERE"
  #     key    = "ADD_KEY_NAME_HERE"
  #     region = "us-east-1"
  #   }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }

    random = {
      source  = "hashicorp/random"
      version = "3.6.2"
    }
  }
}
