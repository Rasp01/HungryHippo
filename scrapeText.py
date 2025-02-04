import json
import shutil
import requests
from bs4 import BeautifulSoup
import os
import time

class HtmlTextExtractor:
    def __init__(self, recipes):
        self.recipes = recipes
        self.html_contents = {}
        self.extracted_texts = {}

    def fetch_html(self):
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        }
        for name, url in self.recipes.items():
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                self.html_contents[name] = response.text
            else:
                print(f"Failed to fetch {url}")
                print(f"Status code: {response.status_code}")
                print(f'Reason: {response.reason}')

    def extract_texts(self):
        for name, html_content in self.html_contents.items():
            soup = BeautifulSoup(html_content, 'html.parser')
            text = soup.get_text(separator='\n')
            text = text.replace(" ", "").replace("\n", "")
            self.extracted_texts[name] = text

    def compare_lengths(self):
        for name, text in self.extracted_texts.items():
            html_content = self.html_contents[name]
            text_length = len(text)
            html_length = len(html_content)
            print(f'Recipe: {name}')
            print(f'Length of extracted text: {text_length}')
            print(f'Length of HTML content: {html_length}')
            print('')

    def save_texts(self, directory):
        # Wipe the directory before saving new files
        if os.path.exists(directory):
            shutil.rmtree(directory)
        os.makedirs(directory)
        for name, text in self.extracted_texts.items():
            file_path = os.path.join(directory, f"{name.replace(' ', '_').lower()}.txt")
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(text)

    def save_html(self, directory):
        # Wipe the directory before saving new files
        if os.path.exists(directory):
            shutil.rmtree(directory)
        os.makedirs(directory)
        for name, html_content in self.html_contents.items():
            file_path = os.path.join(directory, f"{name.replace(' ', '_').lower()}.html")
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(html_content)

# Example usage
if __name__ == "__main__": 

    start_time = time.time()  # Record the start time

    with open(os.path.join('public', 'selectedRecipes.json'), 'r', encoding='utf-8') as f:
        recipes = json.load(f)
        print(recipes)


    extractor = HtmlTextExtractor(recipes)
    extractor.fetch_html()
    extractor.extract_texts()
    extractor.compare_lengths()
    extractor.save_texts('public/recipes')

    end_time = time.time()  # Record the end time
    runtime = end_time - start_time  # Calculate  the runtime
    print(f"Runtime of the program is {runtime:.2f} seconds")  # Print the runtime