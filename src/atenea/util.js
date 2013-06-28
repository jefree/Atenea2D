var Util = {
    /*
      Convierte un string de palabras @words separadas por @sprt, en un arreglo
      con las mismas palabras.

      - words: string de palabras.
      - srpt: separador de las palabras, la coma por defecto.
    */

    StringToArray: function(words, sprt){

        (sprt == null) && (sprt=',');

        return words.replace(REXP_WORDS_SPACE, '').split(sprt);
    }
};
