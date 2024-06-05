$(function() {
    let undoStack = [];
    let redoStack = [];

    function saveState() {
        const state = {
            idea: $("#idea-board").val(),
            plots: $("#plot-board").html(),
            pages: $("#page-board").html()
        };
        undoStack.push(state);
        redoStack = [];  // Clear redo stack
    }

    function restoreState(state) {
        $("#idea-board").val(state.idea);
        $("#plot-board").html(state.plots);
        $("#page-board").html(state.pages);
        addEventListeners($("#plot-board .page-item"));
        addEventListeners($("#page-board .page-item"));
        updatePageNumbers();
    }

    function undo() {
        if (undoStack.length > 1) {
            const currentState = undoStack.pop();
            redoStack.push(currentState);
            const prevState = undoStack[undoStack.length - 1];
            restoreState(prevState);
        }
    }

    function redo() {
        if (redoStack.length > 0) {
            const state = redoStack.pop();
            undoStack.push(state);
            restoreState(state);
        }
    }

    $(".column ul").sortable({
        handle: ".handle",
        placeholder: "ui-state-highlight",
        items: "> .page-item",
        update: function(event, ui) {
            saveState();
            updatePageNumbers();
        }
    }).disableSelection();

    $(".collapse-button").on("click", function() {
        const column = $(this).parent();
        column.toggleClass("collapsed");
        $(this).text(column.hasClass("collapsed") ? '⇨' : '⇦');
    });

    $("#add-plot").on("click", function() {
        addPlot();
    });

    $("#add-page").on("click", function() {
        addPage();
    });

    $("#download-plot").on("click", function() {
        downloadPlots();
    });

    $("#download-page").on("click", function() {
        downloadPages();
    });

    $("#download-dialogue").on("click", function() {
        downloadDialogues();
    });

    $("#save").on("click", function() {
        saveData(false);
    });

    $("#save-as").on("click", function() {
        saveData(true);
    });

    $("#open").on("click", function() {
        openData();
    });

    $("#undo").on("click", function() {
        undo();
    });

    $("#redo").on("click", function() {
        redo();
    });

    function updatePageNumbers() {
        $("#page-board .page-item").each(function(index) {
            const pageNumber = index + 1;
            $(this).attr("data-page-number", pageNumber);
            $(this).find(".dialogue-item").attr("data-page-number", pageNumber);
        });
    }

    function addPlot() {
        const newPlot = $('<li class="page-item" data-page-number="">' +
            '<div class="handle">::</div>' +
            '<textarea class="text" data-default-text="" rows="1"></textarea>' +
            '<button class="small-button delete-plot">削除</button>' +
            '</li>');
        $("#plot-board").append(newPlot);
        addEventListeners(newPlot);
        saveState();
        updatePageNumbers();
    }

    function addPage() {
        const newPage = $('<li class="page-item" data-page-number="new">' +
            '<div class="content-wrapper">' +
            '<div class="page-content">' +
            '<div class="handle">::</div>' +
            '<textarea class="text" data-default-text="" rows="1"></textarea>' +
            '<button class="small-button delete-page">削除</button>' +
            '</div>' +
            '<div class="divider"></div>' +
            '<div class="dialogue-content">' +
            '<ul class="dialogue-container">' +
            '<li class="dialogue-item" data-page-number="new">' +
            '<textarea class="text" data-default-text="新しいセリフ" rows="1"></textarea>' +
            '<button class="small-button delete-dialogue">削除</button>' +
            '</li>' +
            '</ul>' +
            '<div class="add-dialogue-container">' +
            '<button class="small-button add-dialogue">セリフを追加</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</li>');
        $("#page-board").append(newPage);
        addEventListeners(newPage);
        saveState();
        updatePageNumbers();
    }

    function addDialogue(pageItem) {
        const pageNumber = pageItem.attr("data-page-number");
        const newDialogue = $('<li class="dialogue-item" data-page-number="' + pageNumber + '">' +
            '<textarea class="text" data-default-text="" rows="1"></textarea>' +
            '<button class="small-button delete-dialogue">削除</button>' +
            '</li>');
        pageItem.find(".dialogue-container").append(newDialogue);
        addEventListeners(newDialogue);
        saveState();
    }

    function downloadPlots() {
        let plots = "";
        $("#plot-board .text").each(function() {
            plots += $(this).val() + "\n";
        });
        const blob = new Blob([plots], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "plots.txt";
        a.click();
        URL.revokeObjectURL(url);
    }

    function downloadPages() {
        let pages = "";
        $("#page-board .text").each(function() {
            pages += $(this).val() + "\n";
        });
        const blob = new Blob([pages], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "pages.txt";
        a.click();
        URL.revokeObjectURL(url);
    }

    function downloadDialogues() {
        let dialogues = "";
        $("#page-board .dialogue-item .text").each(function() {
            dialogues += $(this).val() + "\n\n";
        });
        const blob = new Blob([dialogues], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "dialogues.txt";
        a.click();
        URL.revokeObjectURL(url);
    }

    function saveData(saveAs) {
        const data = {
            idea: $("#idea-board").val(),
            plots: [],
            pages: []
        };

        $("#plot-board .page-item").each(function() {
            data.plots.push($(this).find(".text").val());
        });

        $("#page-board .page-item").each(function() {
            const page = {
                content: $(this).find(".page-content .text").val(),
                dialogues: []
            };

            $(this).find(".dialogue-item .text").each(function() {
                page.dialogues.push($(this).val());
            });

            data.pages.push(page);
        });

        const blob = new Blob([JSON.stringify(data)], { type: "application/json;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = saveAs ? prompt("ファイル名を入力してください：", "data.json") : "data.json";
        a.click();
        URL.revokeObjectURL(url);
    }

    function openData() {
        const input = $('<input type="file" accept="application/json">');
        input.on("change", function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const data = JSON.parse(e.target.result);
                    loadData(data);
                    saveState();  // 初期状態を保存
                };
                reader.readAsText(file);
            }
        });
        input.click();
    }

    function loadData(data) {
        $("#idea-board").val(data.idea);
        $("#plot-board").empty();
        data.plots.forEach(function(plot) {
            const newPlot = $('<li class="page-item" data-page-number="new">' +
                '<div class="handle">::</div>' +
                '<textarea class="text" rows="1">' + plot + '</textarea>' +
                '<button class="small-button delete-plot">削除</button>' +
                '</li>');
            $("#plot-board").append(newPlot);
            addEventListeners(newPlot);
        });

        $("#page-board").empty();
        data.pages.forEach(function(page, pageIndex) {
            const newPage = $('<li class="page-item" data-page-number="new">' +
                '<div class="content-wrapper">' +
                '<div class="page-content">' +
                '<div class="handle">::</div>' +
                '<textarea class="text" rows="1">' + page.content + '</textarea>' +
                '<button class="small-button delete-page">削除</button>' +
                '</div>' +
                '<div class="divider"></div>' +
                '<div class="dialogue-content">' +
                '<ul class="dialogue-container"></ul>' +
                '<div class="add-dialogue-container">' +
                '<button class="small-button add-dialogue">セリフを追加</button>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</li>');
            const dialogueContainer = newPage.find(".dialogue-container");
            page.dialogues.forEach(function(dialogue) {
                const newDialogue = $('<li class="dialogue-item" data-page-number="' + (pageIndex + 1) + '">' +
                    '<textarea class="text" rows="1">' + dialogue + '</textarea>' +
                    '<button class="small-button delete-dialogue">削除</button>' +
                    '</li>');
                dialogueContainer.append(newDialogue);
                addEventListeners(newDialogue);
            });
            $("#page-board").append(newPage);
            addEventListeners(newPage);
        });

        // テキストエリアのサイズを自動調整
        $("#plot-board .text").each(function() {
            autoResizeTextarea(this);
        });

        $("#page-board .text").each(function() {
            autoResizeTextarea(this);
        });

        updatePageNumbers();
    }

    function addEventListeners(element) {
        element.find(".text").on("input", function() {
            autoResizeTextarea(this);
            saveState();
        });

        element.find(".add-dialogue").on("click", function() {
            addDialogue($(this).closest(".page-item"));
        });

        element.find(".delete-plot").on("click", function() {
            $(this).closest(".page-item").remove();
            updatePageNumbers();
            saveState();
        });

        element.find(".delete-page").on("click", function() {
            $(this).closest(".page-item").remove();
            updatePageNumbers();
            saveState();
        });

        element.find(".delete-dialogue").on("click", function() {
            $(this).closest(".dialogue-item").remove();
            updatePageNumbers();
            saveState();
        });

        // 初期ロード時にテキストエリアを自動リサイズ
        element.find(".text").each(function() {
            autoResizeTextarea(this);
        });
    }

    function autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight) + 'px';
    }

    // 初期要素にイベントリスナーを追加
    $(".page-item").each(function() {
        addEventListeners($(this));
    });

    // 初期状態を保存
    saveState();

    // 各ボードのページ番号を更新
    updatePageNumbers();
});
