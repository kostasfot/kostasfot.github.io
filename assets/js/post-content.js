(() => {
    'use strict';

    const copyButton = document.getElementById('copy-page-link');
    if (copyButton) {
        copyButton.addEventListener('click', async () => {
            const label = copyButton.querySelector('span');
            try {
                await navigator.clipboard.writeText(window.location.href);
                if (label) label.textContent = 'Link copied';
            } catch {
                if (label) label.textContent = 'Copy unavailable';
            }

            window.setTimeout(() => {
                if (label) label.textContent = copyButton.dataset.copyLabel || 'Copy link';
            }, 2200);
        });
    }

    const mermaidBlocks = document.querySelectorAll('pre code.language-mermaid');
    mermaidBlocks.forEach((codeBlock, index) => {
        const diagram = document.createElement('div');
        diagram.className = 'mermaid';
        diagram.id = 'mermaid-diagram-' + (index + 1);
        diagram.textContent = codeBlock.textContent;
        codeBlock.parentElement.replaceWith(diagram);
    });

    if (mermaidBlocks.length && window.mermaid) {
        window.mermaid.initialize({
            startOnLoad: false,
            securityLevel: 'strict',
            theme: 'dark',
            themeVariables: {
                background: '#0f172a',
                primaryColor: '#164e63',
                primaryTextColor: '#e2e8f0',
                primaryBorderColor: '#06b6d4',
                lineColor: '#14b8a6',
                secondaryColor: '#134e4a',
                tertiaryColor: '#0B0F17'
            }
        });
        window.mermaid.run({ querySelector: '.mermaid' });
    }
})();
