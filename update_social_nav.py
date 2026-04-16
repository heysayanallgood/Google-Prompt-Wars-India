import os

d = r'd:\\coding_contents\\PromptWars\\frontend'
for f in os.listdir(d):
    if f.endswith('.html') and f != 'social-hub.html':
        p = os.path.join(d, f)
        with open(p, 'r', encoding='utf-8') as file:
            c = file.read()
            
        if 'social-hub.html' not in c:
            new_c = c.replace(
                '<a href="stadium-map.html">Stadium Map</a>',
                '<a href="stadium-map.html">Stadium Map</a>\n                <a href="social-hub.html">Social Hub</a>'
            )
            # Also handle the case where stadium-map is active
            new_c = new_c.replace(
                '<a href="stadium-map.html" class="active">Stadium Map</a>',
                '<a href="stadium-map.html" class="active">Stadium Map</a>\n                <a href="social-hub.html">Social Hub</a>'
            )
            if new_c != c:
                with open(p, 'w', encoding='utf-8') as file:
                    file.write(new_c)
print("done")
