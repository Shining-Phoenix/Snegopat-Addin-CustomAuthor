//engine: JScript
//uname: customAuthor
//descr: Авторский комментарий(номер задачи из подключаемого источника)
//author: ShiningPhoenix
//help: inplace
//addin: global
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
/// <reference path="./snegopat.d.ts" />
/// <reference path="./v8.d.ts" />
/// <reference path="./stringUtils.ts" />
global.connectGlobals(SelfScript);
/*@
Является развитием скрипта "Авторский комментарий" (author.js) от автора: Александр Кунташов <kuntashov@gmail.com>, http://compaud.ru/blog

Реализует возможности разметки кода по признакам модифицированности с указанием реквизитов автора.
При этом номер задачи берется из подключаемого модуля.
 
Пример:
Пользователь добавляет комментарий. При этом выводится список номеров задач с их описанием из какого-либо внешнего источника(например Jira).
В комментарий подставляется выбранный номер.
@*/
////{ Макросы
////
SelfScript.self['macrosМаркер "Добавлено"'] = function () {
    var authorsComment = new AuthorsComment;
    authorsComment.addMarker(MarkerTypes.ADDED);
};
SelfScript.self['macrosМаркер "Изменено"'] = function () {
    var authorsComment = new AuthorsComment;
    authorsComment.addMarker(MarkerTypes.CHANGED);
};
SelfScript.self['macrosМаркер "Удалено"'] = function () {
    var authorsComment = new AuthorsComment;
    authorsComment.addMarker(MarkerTypes.REMOVED);
};
SelfScript.self['macrosНастройка'] = function () {
    var setupFormControler = new SetupFormControler;
    setupFormControler.show();
};
/* Возвращает название макроса по умолчанию - вызывается, когда пользователь
дважды щелкает мышью по названию скрипта в окне Снегопата. */
function getDefaultMacros() {
    return 'Настройка';
}
////} Макросы
//{ Горячие клавиши по умолчанию.
function getPredefinedHotkeys(predef) {
    predef.setVersion(1);
    predef.add('Маркер "Добавлено"', "Alt + A");
    predef.add('Маркер "Изменено"', "Alt + C");
    predef.add('Маркер "Удалено"', "Alt + D");
}
//} Горячие клавиши по умолчанию.
var pflAuthorJs = 'Авторский комментарий/Настройки';
var MarkerTypes;
(function (MarkerTypes) {
    MarkerTypes["ADDED"] = "\u041C\u0430\u0440\u043A\u0435\u0440\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u043E";
    MarkerTypes["REMOVED"] = "\u041C\u0430\u0440\u043A\u0435\u0440\u0423\u0434\u0430\u043B\u0435\u043D\u043E";
    MarkerTypes["CHANGED"] = "\u041C\u0430\u0440\u043A\u0435\u0440\u0418\u0437\u043C\u0435\u043D\u0435\u043D\u043E";
})(MarkerTypes || (MarkerTypes = {}));
var AuthorSetting = /** @class */ (function () {
    function AuthorSetting() {
        this.markerFormatStringParameters = {};
        //{ Параметры подстановки, используемые в форматной строке подписи.
        this.addFormatStringParam("ИмяПользователя", "parseTpl(name)");
        this.addFormatStringParam("ПолноеИмяПользователя", "parseTpl(name)");
        this.addFormatStringParam("ИмяПользователяХранилищаКонфигурации", "parseTpl(name)");
        this.addFormatStringParam("ДатаВремя", "parseTpl(name, '\"' + p + '\"')");
        this.addFormatStringParam('ИмяПользователяОС', "(new ActiveXObject('WScript.Shell')).ExpandEnvironmentStrings('%USERNAME%')");
        //[+] Brad 19.12.2013
        this.addFormatStringParam("ТекущаяЗадача", "getCurentTask()");
        // Brad 19.12.2013
        //} Параметры подстановки, используемые в форматной строке подписи.
        this.settings = this.getSettings();
    }
    AuthorSetting.prototype.addFormatStringParam = function (name, code) {
        var paramGetter = function (p) {
            return eval(code);
        };
        this.markerFormatStringParameters[name] = paramGetter;
    };
    AuthorSetting.prototype.getSettings = function () {
        var s = v8New("Структура");
        /* Настройки для подписи. Общий формат подписи:
        
        //<Маркер> <Подпись>
        ... содержимое блока ...
        //<ЗакрывающийМаркерБлока> <Подпись>
        
        Для однострочника не используется завершающая часть комментария,
        т.к. однострочник добавляется в конец строки. */
        // Настройки по умолчанию.
        s.Вставить("ФорматПодписи", "%ИмяПользователяОС% %ДатаВремя#ДФ=dd.MM.yyyy%");
        s.Вставить("МаркерДобавлено", "Добавлено:");
        s.Вставить("МаркерУдалено", "Удалено:");
        s.Вставить("МаркерИзменено", "Изменено:");
        s.Вставить("ЗакрывающийМаркерБлока", "/");
        s.Вставить("РазделительКодаПриЗамене", "---- Заменено на: ----");
        // Дополнительные настройки:
        s.Вставить("НеОставлятьКопиюКодаПриЗамене", false);
        s.Вставить("НеДобавлятьСигнатуруПослеЗакрывающегоМаркера", false);
        profileRoot.createValue(pflAuthorJs, s, pflSnegopat);
        s = profileRoot.getValue(pflAuthorJs);
        return s;
    };
    AuthorSetting.prototype.saveSetting = function () {
        profileRoot.setValue(pflAuthorJs, this.settings);
    };
    return AuthorSetting;
}());
var SetupFormControler = /** @class */ (function (_super) {
    __extends(SetupFormControler, _super);
    function SetupFormControler() {
        var _this = _super.call(this) || this;
        _this.form = loadScriptFormEpf(SelfScript.fullPath.replace(/js$/, 'epf'), "Форма ", _this);
        return _this;
    }
    //{ Обработчики элементов управления формы
    SetupFormControler.prototype.ПриОткрытии = function () {
        ЗаполнитьЗначенияСвойств(this.form, this.settings);
    };
    SetupFormControler.prototype.КнопкаОкНажатие = function (Элемент) {
        ЗаполнитьЗначенияСвойств(this.settings, this.form);
        this.saveSetting();
        this.form.Close();
    };
    SetupFormControler.prototype.КнопкаОтменаНажатие = function (Элемент) {
        this.form.Close();
    };
    SetupFormControler.prototype.НадписьИмяПользователяНажатие = function (Элемент) {
        this.addToSignatureFormat(this.form, Элемент.val.Заголовок);
    };
    SetupFormControler.prototype.НадписьПолноеИмяПользователяНажатие = function (Элемент) {
        this.addToSignatureFormat(this.form, Элемент.val.Заголовок);
    };
    SetupFormControler.prototype.НадписьИмяПользователяХранилищаКонфигурацииНажатие = function (Элемент) {
        this.addToSignatureFormat(this.form, Элемент.val.Заголовок);
    };
    SetupFormControler.prototype.НадписьИмяПользователяОСНажатие = function (Элемент) {
        this.addToSignatureFormat(this.form, Элемент.val.Заголовок);
    };
    SetupFormControler.prototype.НадписьДатаВремяНажатие = function (Элемент) {
        var КонструкторФорматнойСтроки = v8New("КонструкторФорматнойСтроки");
        КонструкторФорматнойСтроки.ДоступныеТипы = v8New("ОписаниеТипов", "Дата");
        if (КонструкторФорматнойСтроки.ОткрытьМодально())
            this.addToSignatureFormat(this.form, "ДатаВремя#" + КонструкторФорматнойСтроки.Текст);
    };
    SetupFormControler.prototype.НадписьТекущаяЗадачаНажатие = function (Элемент) {
        this.addToSignatureFormat(this.form, Элемент.val.Заголовок);
    };
    //} Обработчики элементов управления формы
    SetupFormControler.prototype.addToSignatureFormat = function (form, paramName) {
        if (!form['ФорматПодписи'].match(/^\s+$/))
            form['ФорматПодписи'] += ' ';
        form['ФорматПодписи'] += '%' + paramName + '%';
    };
    SetupFormControler.prototype.show = function () {
        this.form.DoModal();
    };
    return SetupFormControler;
}(AuthorSetting));
var AuthorsComment = /** @class */ (function (_super) {
    __extends(AuthorsComment, _super);
    function AuthorsComment() {
        return _super.call(this) || this;
    }
    AuthorsComment.prototype.getCurentTask = function () {
        var pflCurTask = 'Задачи/ТекущаяЗадача';
        var s = v8New("Структура", "Задача,Описание", "", "");
        profileRoot.createValue(pflCurTask, s, pflSnegopat);
        s = profileRoot.getValue(pflCurTask);
        var task = '';
        s.Property('Задача', task);
    };
    AuthorsComment.prototype.addMarker = function (markerType) {
        var textWindow = snegopat.activeTextWindow();
        if (!textWindow)
            return;
        var sel = textWindow.getSelection();
        if (sel.beginRow == sel.endRow) {
            // Однострочник.     
            var selectedText = textWindow.selectedText;
            var code = this.markLine(markerType, selectedText);
            textWindow.selectedText = code;
        }
        else {
            // Блок кода.
            var endRow = sel.endCol > 1 ? sel.endRow : sel.endRow - 1;
            textWindow.setSelection(sel.beginRow, 1, endRow, 10000);
            var block = textWindow.selectedText;
            var code = this.markBlock(markerType, block);
            textWindow.selectedText = block;
        }
    };
    AuthorsComment.prototype.getSignature = function () {
        var fmt = this.settings['ФорматПодписи'];
        //Павлюков С.Ю. - изменена строка: иначе дата должна была быть только последней
        //var ptn = /%(.+?)(?:#(.+)){0,1}%/ig;
        var ptn = /%(.+?)(?:#(.+^%)){0,1}%/ig;
        return fmt.replace(ptn, function (match, p1, p2, offset, s) {
            // p1 - имя управляющей конструкции.
            // p2 - параметр управляющей конструкции (для ДатаВремя).
            //Павлюков С.Ю. - добавлено условие с разбором даты и формата
            if (p1.match("(.+)#(.+)")) {
                p1 = RegExp.$1;
                p2 = RegExp.$2;
            }
            if (!this.markerFormatStringParameters[p1]) {
                Message('В настройках подписи для авторского комментария встретилась неизвестная конструкция "' + p1 + '"');
                return p1;
            }
            return this.markerFormatStringParameters[p1].call(null, p2);
        });
    };
    AuthorsComment.prototype.getStartComment = function (markerType) {
        return "//" + this.settings[markerType] + " " + this.getSignature();
    };
    AuthorsComment.prototype.getEndComment = function () {
        var endComment = "//" + this.settings["ЗакрывающийМаркерБлока"];
        if (!this.settings["НеДобавлятьСигнатуруПослеЗакрывающегоМаркера"])
            endComment += " " + this.getSignature();
        return endComment;
    };
    AuthorsComment.prototype.markLine = function (markerType, line) {
        // Удалим концевые пробелы в строке.
        var code = line.replace(/(.+?)\s*$/, "$1");
        switch (markerType) {
            case MarkerTypes.ADDED:
                // Добавляем в хвост подпись.
                code = code + this.getStartComment(markerType);
                break;
            case MarkerTypes.REMOVED:
                // Закомментируем строку и в хвост добавим подпись.
                code = this.commentLine(code, 0) + this.getStartComment(markerType);
                break;
            case MarkerTypes.CHANGED:
                // Маркер "Изменено" для однострочника такой же как и для блока.
                var indent = StringUtils.getIndent(code);
                code = indent + this.getStartComment(markerType) + "\n";
                code += this.prepareChangedBlock(line, indent) + "\n";
                code += indent + this.getEndComment() + "\n";
                break;
        }
        return code;
    };
    AuthorsComment.prototype.markBlock = function (markerType, block) {
        var indent = StringUtils.getIndent(block);
        var code = indent + this.getStartComment(markerType) + "\n";
        switch (markerType) {
            case MarkerTypes.ADDED:
                code += block + "\n";
                break;
            case MarkerTypes.REMOVED:
                code += this.commentBlock(block, indent) + "\n";
                break;
            case MarkerTypes.CHANGED:
                code += this.prepareChangedBlock(block, indent) + "\n";
                break;
        }
        //Комментарий окончания изменений.
        code += indent + this.getEndComment();
        return code;
    };
    AuthorsComment.prototype.prepareChangedBlock = function (block, indent) {
        var code = '';
        if (!this.settings["НеОставлятьКопиюКодаПриЗамене"]) {
            code += this.commentBlock(block, indent) + "\n";
            if (this.settings["РазделительКодаПриЗамене"])
                code += indent + "//" + this.settings["РазделительКодаПриЗамене"] + "\n";
        }
        code += block;
        return code;
    };
    AuthorsComment.prototype.commentLine = function (line, indent) {
        // Комментарий поставим после отступа.
        if (!indent)
            indent = '\\s+';
        return line.replace(new RegExp('^(' + indent + ')(.*)'), "$1//$2");
    };
    AuthorsComment.prototype.commentBlock = function (block, indent) {
        var lines = StringUtils.toLines(block, 0);
        for (var i = 0; i < lines.length; i++)
            lines[i] = this.commentLine(lines[i], indent);
        return StringUtils.fromLines(lines, 0);
    };
    AuthorsComment.prototype.parseTpl = function () {
        var a = [];
        for (var i = 0; i < arguments.length; i++)
            a.push(arguments[i]);
        return snegopat.parseTemplateString('<?"", ' + a.join(',') + '>');
    };
    return AuthorsComment;
}(AuthorSetting));
