# Terraform S3 Backend Configuration and Deployment

**IMPORTANT**: Remember to request access to the **Amazon Titan Image Generator G1 model** within your chosen region
inside Amazon
Bedrock in order to be able to use it.

## Steps for deploying the Terraform infrastructure

* Create an S3 bucket within your chosen region into which you wish to deploy the Terraform plan.
* Uncomment `backend "local"` within the `terraform.tf` script.
* Comment in the following code block:

```terraform
    backend "s3" {
      bucket = "ADD_BUCKET_NAME_HERE"
      key    = "ADD_KEY_NAME_HERE"
      region = "us-east-1"
    }
```

* Add the required values to the S3 configuration:
    * `ADD_BUCKET_NAME_HERE`: Add the S3 bucket name to contain the Terraform plan (the bucket created in the first
      step).
    * `ADD_KEY_NAME_HERE`: Add the logical path within the S3 bucket where the Terraform state file will be stored, e.g.
      `terraform/state/terraform.tfstate`.
    * `REGION`: Add the region into wich you wish to deploy, eg. "us-east-1"
* Run `terraform init`
* Run `terraform plan -var "region_name=us-east-1" -out=image-generator-plan` (or whichever alternative region you may wish to
  use)
* Run `terraform apply image-generator-plan`

The API Gateway and Lambda function will now be deployed and are ready for use.
Use the URL defined under the `POST`-method within the Gateway `dev` stage in order to call the Lambda function.
