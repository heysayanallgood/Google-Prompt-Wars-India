import os

d = r'd:\coding_contents\PromptWars\frontend'
for f in os.listdir(d):
    if f.endswith('.html') and f != 'stadium-map.html':
        p = os.path.join(d, f)
        with open(p, 'r', encoding='utf-8') as file:
            c = file.read()
            
        if 'stadium-map.html' not in c:
            c = c.replace(
                '<a href="dashboard.html">Live Dashboard</a>', 
                '<a href="dashboard.html">Live Dashboard</a>\n                <a href="stadium-map.html">Stadium Map</a>'
            )
            c = c.replace(
                '<a href="dashboard.html" class="active">Live Dashboard</a>', 
                '<a href="dashboard.html" class="active">Live Dashboard</a>\n                <a href="stadium-map.html">Stadium Map</a>'
            )
            with open(p, 'w', encoding='utf-8') as file:
                file.write(c)
