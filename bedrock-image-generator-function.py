import os
import json
import boto3
import base64
import datetime
import logging


client_bedrock = boto3.client('bedrock-runtime')
client_s3 = boto3.client('s3')
logger = logging.getLogger(__name__)


def lambda_handler(event, context):
    
    if 'prompt' not in event:
        return  {
            'statusCode': 400,
            'body': json.dumps('A prompt needs to be passed in the query string parameters')
        }
    
    prompt = event['prompt']
    
    body = json.dumps(
        {
            'taskType': 'TEXT_IMAGE',
            'textToImageParams': {
                'text':prompt
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

    try:
        
        bedrock_response = client_bedrock.invoke_model(
            body=body, 
            modelId='amazon.titan-image-generator-v1',
            accept='application/json', 
            contentType='application/json')
 
        bedrock_response_bytes = json.loads(bedrock_response['body'].read())
        bedrock_response_base64 = bedrock_response_bytes['images'][0]
        bedrock_response_image = base64.b64decode(bedrock_response_base64)
    
        image_name = 'ai-image'+ datetime.datetime.today().strftime('%Y-%m-%d-%H-%M')
    
        response_s3 =client_s3.put_object(
            Bucket=os.environ['IMAGE_STORAGE_BUCKET'],
            Body=bedrock_response_image,
            Key=image_name)
        
        generate_presigned_url = client_s3.generate_presigned_url('get_object', Params={'Bucket':'bedrock-image-creator-bucket-2024-05-08','Key':image_name}, ExpiresIn=3600)
    
        logger.info(generate_presigned_url)
    
        return {
            'statusCode': 200,
            'body': generate_presigned_url
        }
    
    except Exception as e:
        logger.error(f'Could not invoke the Titan Image Generator Model: {e}.')
    raise
    
