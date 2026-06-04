import re
with open("/Users/cerfbaleine/workspace/busrom-work/web/components/lexical/LexicalRenderer.tsx", "r") as f:
    content = f.read()

# Extract the TagInterceptLink definition
tag_intercept_pattern = r"const TagInterceptLink = \(\{.*?\}\);.*?};"
match = re.search(r"const TagInterceptLink = \(\{[\s\S]*?^};", content, re.MULTILINE)
if match:
    tag_intercept_code = match.group(0)
    # Remove the broken part:
    # };
    # 
    # const TagInterceptLink = ...
    #
    # export const customConverters: JSXConverters = {
    
    # We replace that whole chunk with just empty string (we will fix the paragraph to link transition next)
    broken_chunk_regex = r"\n};\n\nconst TagInterceptLink = [\s\S]*?export const customConverters: JSXConverters = {\n"
    content = re.sub(broken_chunk_regex, "\n", content)
    
    # Now insert the TagInterceptLink right before export const customConverters: JSXConverters = {
    content = content.replace("export const customConverters: JSXConverters = {", tag_intercept_code + "\n\nexport const customConverters: JSXConverters = {", 1)

with open("/Users/cerfbaleine/workspace/busrom-work/web/components/lexical/LexicalRenderer.tsx", "w") as f:
    f.write(content)

