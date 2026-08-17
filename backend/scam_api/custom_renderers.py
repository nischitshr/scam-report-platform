from rest_framework.renderers import JSONRenderer

class CustomRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context.get('response')
        
        if response and response.status_code >= 400:
            if isinstance(data, dict) and 'success' in data and not data['success']:
                formatted_data = data
            else:
                message = "An error occurred"
                error_field = "non_field_errors"
                details = data
                
                if isinstance(data, dict):
                    if len(data) > 0:
                        first_key = list(data.keys())[0]
                        error_field = first_key
                        val = data[first_key]
                        if isinstance(val, list) and len(val) > 0:
                            message = str(val[0])
                        elif isinstance(val, dict):
                            message = "Nested validation error"
                        else:
                            message = str(val)
                elif isinstance(data, list) and len(data) > 0:
                    message = str(data[0])
                elif isinstance(data, str):
                    message = data
                    
                formatted_data = {
                    "success": False,
                    "error": error_field,
                    "message": message,
                    "details": details
                }
        else:
            if isinstance(data, dict) and 'success' in data:
                formatted_data = data
            else:
                formatted_data = {
                    "success": True,
                    "data": data,
                    "message": "Operation successful"
                }

        return super(CustomRenderer, self).render(formatted_data, accepted_media_type, renderer_context)
