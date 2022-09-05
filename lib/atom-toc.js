const {CompositeDisposable} = require('atom')

module.exports = {
    subscriptions: null,

    activate () {
        this.subscriptions = new CompositeDisposable()

        this.subscriptions.add(atom.commands.add('atom-workspace',
            {'atom-toc:new': () => this.newTOC()})
        )

        this.subscriptions = atom.commands.add("atom-workspace", {
            "atom-toc:goto": () => this.goToToc(),
        })

        this.subscriptions = atom.commands.add("atom-workspace", {
            "atom-toc:addTocHeader": () => this.addTocHeader(),
        })
    },

    deactivate () {
        this.subscriptions.dispose();
    },

    newTOC() {
        const editor = atom.workspace.getActiveTextEditor()

        if (editor) {

            editor.setCursorBufferPosition([0,0]);

            const existingTocContent = editor.getBuffer().getLines();

            // Delete any existing TOCs by finding end marker
            const reg = new RegExp("\/\* >>> end");

            for (var j = 0; j < editor.getLineCount(); j++) {
                let text = existingTocContent[j];

                if(reg.test(text)) {
                    editor.setCursorBufferPosition([j+1,0]);
                    editor.selectToTop();
                    editor.delete();
                }
            }

            // Pull editor content without original TOCs & iterate for text in Header format
            const originalContent = editor.getBuffer().getLines();

            const re = new RegExp("(\/\* >>>>>> )+");

            const tableOfContents = [];

            for (var i = 0; i <= editor.getLineCount(); i++) {
                let text = originalContent[i];

                if(re.test(text)) {
                    tableOfContents.push([i+1, text]);
                }
            }

            // Iterate back over headings to change Row Numbers by numberOfContents + 2 (for heading & end line)
            const tocOffset = tableOfContents.length + 2;

            editor.insertText("/* ***************** Table Of Contents ***************** */");
            editor.insertText('\n');

            for (var i = 0; i < tableOfContents.length; i++) {
                tableOfContents[i][0] = tableOfContents[i][0] + tocOffset;

                tableOfContents[i][2] = tableOfContents[i][1].slice(0, tableOfContents[i][1].length - 3) + " - R:" + tableOfContents[i][0] + tableOfContents[i][1].slice(tableOfContents[i][1].length - 3);

                editor.insertText(tableOfContents[i][2]);
                editor.insertText('\n');
            }

            editor.insertText("/* >>> end */");
            editor.insertText('\n');
        }
    },

    addTocHeader() {
        const editor = atom.workspace.getActiveTextEditor()
        editor.insertText('/* >>>>>> --------------- *TITLE */');
        editor.insertText('\n');
        this.newTOC();
    },

    goToToc() {
        console.log('goToToc used');
        const editor = atom.workspace.getActiveTextEditor()
        if (editor) {
            const cursorPosition = editor.getCursorBufferPosition()
            const row = cursorPosition['row'];
            let contentline = editor.getBuffer().getLines()[row];
            console.log(contentline);

            let rowToVisit = contentline.split("R:");
            rowToVisit = rowToVisit[1].split(" ");
            rowToVisit = rowToVisit[0] - 1;

            let point = ([rowToVisit, 0]);

            editor.setCursorBufferPosition(point);
            editor.scrollToBufferPosition(point);
        }
    }
}
