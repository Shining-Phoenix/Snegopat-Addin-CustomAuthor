//{ Вспомогательные методы для работы со строками и текстовыми блоками.
var StringUtils;
(function (StringUtils) {
    /* Получить отступ блока текста (по первой строке блока).
     Возвращает строку - пробельные символы, формирующие отступ. */
    function getIndent(code) {
        var matches = code.match(/(^\s+?)(\S|\n|\r)/);
        if (matches)
            return matches[1].replace(/\n|\r/, '');
        return '';
    }
    StringUtils.getIndent = getIndent;
    /* Увеличивает отступ у текстового блока, добавляя строку пробельных символов,
    переданных в качестве значения второго параметра ind.
    Возвращает текстовый блок с добавленным отступом. */
    function shiftRight(code, ind) {
        if (ind)
            return ind + code.replace(/\n/gm, "\n" + ind);
        return code;
    }
    StringUtils.shiftRight = shiftRight;
    /* Уменьшает отступ у текстового блока, удаляя строку пробельных символов,
    совпадающую со строкой, переданной в качестве значения второго параметра ind.
    Возвращает текстовый блок с уменьшенным отступом. */
    function shiftLeft(code, ind) {
        if (ind) {
            var re = new RegExp("^" + ind, 'gm');
            return code.replace(re, "");
        }
        return code;
    }
    StringUtils.shiftLeft = shiftLeft;
    /* Проверяет, оканчивается ли строка str подстрокой suffix.
    Возвращает true, если хвост строки совпадает с suffix, и false в противном случае. */
    function endsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }
    StringUtils.endsWith = endsWith;
    /* Разбивает переданный блок текста на строки и возвращает массив строк. */
    function toLines(code, nl) {
        return code.split(nl ? nl : "\n");
    }
    StringUtils.toLines = toLines;
    /* Объединяет массив строк в строку - блок текста. */
    function fromLines(linesArray, nl) {
        return linesArray.join(nl ? nl : "\n");
    }
    StringUtils.fromLines = fromLines;
    /* Экранирует все символы в строке. */
    function addSlashes(str) {
        return str.replace(/([^\d\w\sА-я])/g, "\\$1");
    }
    StringUtils.addSlashes = addSlashes;
})(StringUtils || (StringUtils = {}));
//} Вспомогательные методы для работы со строками и текстовыми блоками.
