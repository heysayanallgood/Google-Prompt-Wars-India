import os

d = r'd:\coding_contents\PromptWars\frontend'
for f in os.listdir(d):
    if f.endswith('.html') and f != 'organizer-panel.html':
        p = os.path.join(d, f)
        with open(p, 'r', encoding='utf-8') as file:
            c = file.read()
            
        if 'organizer-panel.html' not in c:
            c = c.replace(
                '<a href="dashboard.html" class="active"><span class="icon">⊞</span> Overview</a>',
                '<a href="dashboard.html" class="active"><span class="icon">⊞</span> Overview</a>\n                <a href="organizer-panel.html"><span class="icon">🛂</span> Mission Control</a>'
            )
            c = c.replace(
                '<a href="dashboard.html"><span class="icon">⊞</span> Overview</a>',
                '<a href="dashboard.html"><span class="icon">⊞</span> Overview</a>\n                <a href="organizer-panel.html"><span class="icon">🛂</span> Mission Control</a>'
            )
            with open(p, 'w', encoding='utf-8') as file:
                file.write(c)
