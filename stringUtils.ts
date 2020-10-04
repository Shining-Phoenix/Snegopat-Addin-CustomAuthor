//{ Вспомогательные методы для работы со строками и текстовыми блоками.
namespace StringUtils {
    
    /* Получить отступ блока текста (по первой строке блока).
     Возвращает строку - пробельные символы, формирующие отступ. */
    export function getIndent(code) {
        var matches = code.match(/(^\s+?)(\S|\n|\r)/);
        
        if (matches)
            return matches[1].replace(/\n|\r/, '');
            
        return '';
    }

    /* Увеличивает отступ у текстового блока, добавляя строку пробельных символов,
    переданных в качестве значения второго параметра ind. 
    Возвращает текстовый блок с добавленным отступом. */
    export function shiftRight(code, ind) {
        if (ind)
            return ind + code.replace(/\n/gm, "\n" + ind);
            
        return code;
    }

    /* Уменьшает отступ у текстового блока, удаляя строку пробельных символов,
    совпадающую со строкой, переданной в качестве значения второго параметра ind.
    Возвращает текстовый блок с уменьшенным отступом. */
    export function shiftLeft(code, ind) {
        if (ind)
        {
            var re = new RegExp("^" + ind, 'gm');
            return code.replace(re, "");
        }
            
        return code;
    }

    /* Проверяет, оканчивается ли строка str подстрокой suffix.
    Возвращает true, если хвост строки совпадает с suffix, и false в противном случае. */ 
    export function endsWith(str, suffix)  {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }
    
    /* Разбивает переданный блок текста на строки и возвращает массив строк. */
    export function toLines(code, nl) {
        return code.split(nl ? nl : "\n");
    }
    
    /* Объединяет массив строк в строку - блок текста. */
    export function fromLines(linesArray, nl) {
        return linesArray.join(nl ? nl : "\n");
    }
    
    /* Экранирует все символы в строке. */
    export function addSlashes(str) {
        return str.replace(/([^\d\w\sА-я])/g, "\\$1");
    }

}
//} Вспомогательные методы для работы со строками и текстовыми блоками.