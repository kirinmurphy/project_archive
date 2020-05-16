# markdown-compiler
Compiles markdown /source_files and /shared snippets to custom formatted HTML.
- Injects partial snippets from /shared into /source_files documents with 
  
  ```<!-- inject: ../shared/shared_snippet.md -->``` 
- Wraps sections and subsections in more modular DOM wrappers
- Displays output HTML files in web view with file list navigation
- Re-displays last viewed file on page refresh (saved in localStorage)

## run
- ```npm install```
- ```npm install gulp-cli -g```
- ```gulp``` - for development 
- ```gulp watch``` - for editing files

## loading the web app
- simple server ```npm install node-static```
- run ```static -p 8080```
- view on localhost:8080/web