import os
import json
import boto3
import base64
import datetime
import logging


client_bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')
client_s3 = boto3.client('s3')
logger = logging.getLogger(__name__)


def lambda_handler(event, context):
    
    if 'body' not in event or not event['body']:
        return  {
            'statusCode': 400,
            'body': json.dumps('A prompt needs to be passed as part of the request body')
        }
        
    request_body = json.loads(event['body'])
    prompt = request_body.get('prompt')
    
    if not isinstance(request_body, dict) or not request_body or not prompt:
        return  {
            'statusCode': 400,
            'body': json.dumps('A prompt needs to be passed as part of the request body')
        }
    
    try:
    
        body = json.dumps(
            {
                'taskType': 'TEXT_IMAGE',
                'textToImageParams': {
                    'text': prompt
                },
                'imageGenerationConfig': {
                    'numberOfImages': 1,  
                    'quality': 'premium',  
                    'height': 768,        
                    'width': 1280,         
                    'cfgScale': 7.5,       
                    'seed': 42             
                }
            })

        
        response = client_bedrock.invoke_model(
            body=body, 
            modelId='amazon.titan-image-generator-v1',
            accept='application/json', 
            contentType='application/json')
 
        response_bytes = json.loads(response['body'].read())
        response_base64 = response_bytes['images'][0]
        response_image = base64.b64decode(response_base64)
    
        image_name = datetime.datetime.today().strftime('%Y-%m-%d-%H-%M') + '-ai-image'
    
        response_s3 =client_s3.put_object(
            Bucket=os.environ['IMAGE_STORAGE_BUCKET'],
            Body=response_image,
            Key=image_name)
        
        generate_presigned_url = client_s3.generate_presigned_url('get_object', Params={'Bucket':'bedrock-image-creator-bucket-2024-05-08','Key':image_name}, ExpiresIn=3600)
    
        logger.info(generate_presigned_url)
    
        return {
            'statusCode': 200,
            'body': generate_presigned_url,
            'headers': {
                'Access-Control-Allow-Headers' : 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST'
            }
        }
    
    except Exception as e:
        logger.error(f'Could not invoke the Titan Image Generator Model: {e}.')
    raise

