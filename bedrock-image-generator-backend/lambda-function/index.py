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
        negative_text = request_body.get('negativeText')

        text_to_image_params = {}

        if negative_text is None or negative_text.strip() == '':
            text_to_image_params = {
                'text': prompt
            }
        else:
            text_to_image_params = {
                'text': prompt,
                'negativeText': negative_text
            }

        number_of_images = request_body.get('numberOfImages')
        landscape_format = request_body.get('landscapeFormat')

        if number_of_images is None:
            number_of_images = 1

        width = 768
        height = 1280

        if landscape_format is True or landscape_format is None:
            width = 1280
            height = 768

        body = json.dumps(
            {
                'taskType': 'TEXT_IMAGE',
                'textToImageParams': text_to_image_params,
                'imageGenerationConfig': {
                    'numberOfImages': number_of_images,
                    'quality': 'premium',
                    'height': height,
                    'width': width,
                    'cfgScale': 7.5
                }
            }
        )

        logger.info('Model payload:', body)

        response = client_bedrock.invoke_model(
            body=body,
            modelId='amazon.titan-image-generator-v1',
            accept='application/json',
            contentType='application/json'
        )

        logger.info('Model response:', response)

        response_bytes = json.loads(response['body'].read())

    except Exception as e:
        logger.error(f"Could not invoke the Titan Image Generator Model: {e}.")
        return {
            'statusCode': 500,
            'body': json.dumps(e)
        }

    try:
        image_array = response_bytes['images']
        presigned_urls = []

        for i in range(len(image_array)):
            response_base64 = image_array[i]
            response_image = base64.b64decode(response_base64)

            image_name = datetime.datetime.today().strftime('%Y-%m-%d-%H-%M-%S') + '-' + str(i) + '-ai-image'

            client_s3.put_object(
                Bucket=IMAGE_STORAGE_BUCKET,
                Body=response_image,
                Key=image_name)

            generated_presigned_url = client_s3.generate_presigned_url(
                'get_object',
                Params={'Bucket': IMAGE_STORAGE_BUCKET, 'Key': image_name},
                ExpiresIn=3600
            )

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
        logger.error(f"Could not generate the pre-signed URLs: {e}.")
        return {
            'statusCode': 500,
            'body': json.dumps(e)
        }
