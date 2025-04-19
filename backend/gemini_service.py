# backend/gemini_service.py
import os
import google.generativeai as genai
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            logger.warning("GEMINI_API_KEY environment variable not set. Gemini service will not work.")
            self.model = None
            return

        try:
            genai.configure(api_key=self.api_key)
            # Using gemini-1.5-flash as a generally available and capable free-tier model
            # Check Google AI documentation for the latest available models
            self.model = genai.GenerativeModel('gemini-1.5-flash') 
            logger.info("Gemini Service initialized successfully with gemini-1.5-flash.")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini Service: {e}")
            self.model = None

    def generate_analysis(self, question):
        if not self.model:
            logger.error("Gemini model not initialized. Cannot generate analysis.")
            return "[Gemini Service not initialized. Check API key and logs.]"

        try:
            # Simple generation call - you might want to add safety settings, etc.
            logger.info(f"Sending question to Gemini: {question[:100]}...") # Log truncated question
            response = self.model.generate_content(question)
            
            # Log the full response for debugging if needed (can be verbose)
            # logger.debug(f"Full Gemini response: {response}")

            # Access the generated text - handle potential API changes or errors
            if response.parts:
                generated_text = response.text
                logger.info("Received analysis from Gemini.")
                return generated_text
            else:
                 # Log the prompt feedback if generation was blocked
                 if response.prompt_feedback:
                      logger.warning(f"Gemini generation blocked: {response.prompt_feedback}")
                      return f"[Gemini generation blocked: {response.prompt_feedback}]"
                 else:
                     logger.error("Gemini response did not contain expected text parts.")
                     return "[Error: Received unexpected response format from Gemini]"

        except Exception as e:
            logger.error(f"Error during Gemini API call: {e}")
            return f"[Error generating analysis with Gemini: {e}]"

# Initialize the service instance for import
gemini_service = GeminiService() 