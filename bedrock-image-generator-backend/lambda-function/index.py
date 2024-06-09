import os
import json
import boto3
import base64
import datetime
import logging

REGION_NAME = os.environ['REGION_NAME']
IMAGE_STORAGE_BUCKET = os.environ['IMAGE_STORAGE_BUCKET']

client_bedrock = boto3.client('bedrock-runtime', region_name=REGION_NAME)
client_s3 = boto3.client('s3')
logger = logging.getLogger(__name__)


def lambda_handler(event, context):
    if 'body' not in event or not event['body']:
        return {
            'statusCode': 400,
            'body': json.dumps('A prompt needs to be passed as part of the request body')
        }

    request_body = json.loads(event['body'])
    prompt = request_body.get('prompt')

    if not isinstance(request_body, dict) or not request_body or not prompt:
        return {
            'statusCode': 400,
            'body': json.dumps('A prompt needs to be passed as part of the request body')
        }

    try:
        number_of_images = request_body.get('numberOfImages')

        if number_of_images is None:
            number_of_images = 1

        body = json.dumps(
            {
                'taskType': 'TEXT_IMAGE',
                'textToImageParams': {
                    'text': prompt
                },
                'imageGenerationConfig': {
                    'numberOfImages': number_of_images,
                    'quality': 'premium',
                    'height': 768,
                    'width': 1280,
                    'cfgScale': 7.5,
                    'seed': 42
                }
            }
        )

        response = client_bedrock.invoke_model(
            body=body,
            modelId='amazon.titan-image-generator-v1',
            accept='application/json',
            contentType='application/json')

        response_bytes = json.loads(response['body'].read())

        presigned_urls = []

        for i in range(number_of_images):
            response_base64 = response_bytes['images'][i]
            response_image = base64.b64decode(response_base64)

            image_name = datetime.datetime.today().strftime('%Y-%m-%d-%H-%M') + '-' + str(i) + '-ai-image'

            client_s3.put_object(
                Bucket=IMAGE_STORAGE_BUCKET,
                Body=response_image,
                Key=image_name)

            generated_presigned_url = client_s3.generate_presigned_url(
                'get_object',
                Params={'Bucket': IMAGE_STORAGE_BUCKET, 'Key': image_name},
                ExpiresIn=3600
            )

            logger.info(generated_presigned_url)

            presigned_urls.append(generated_presigned_url)

        return {
            'statusCode': 200,
            'body': json.dumps(presigned_urls),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST'
            }
        }

    except Exception as e:
        logger.error(f'Could not invoke the Titan Image Generator Model: {e}.')
        raise
