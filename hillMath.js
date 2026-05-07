

const modulo = (valor, base) => {
    let resultado = valor % base;
    return resultado < 0 ? resultado + base : resultado;
};

const gcd = (a, b) => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    return a;
};

const inversoMultiplicativo = (numero, base) => {
    numero = modulo(numero, base);
    for (let x = 1; x < base; x++) {
        if (modulo(numero * x, base) === 1) return x;
    }
    return -1;
};

const validarMatriz = (a, b, c, d) => {
    let determinante = (a * d) - (b * c);
    let detMod = modulo(determinante, 26);

    if (detMod === 0) return { ok: false, msg: "El determinante es 0 (mod 26). La matriz no es invertible." };
    if (gcd(detMod, 26) !== 1) return { ok: false, msg: `Det = ${detMod} no es coprimo con 26. Usa una clave recomendada.` };

    return { ok: true, msg: `Det = ${determinante} → ${detMod} (mod 26). Clave válida.` };
};

const calcularMatrizInversa = (a, b, c, d) => {
    let strDeterminante = (a * d) - (b * c);
    let invMultiplicativo = inversoMultiplicativo(modulo(strDeterminante, 26), 26);

    let invA = modulo(d * invMultiplicativo, 26);
    let invB = modulo(-b * invMultiplicativo, 26);
    let invC = modulo(-c * invMultiplicativo, 26);
    let invD = modulo(a * invMultiplicativo, 26);

    return [invA, invB, invC, invD];
};

const limpiarTexto = (texto) => {
    let limpio = "";
    texto = texto.toUpperCase();
    for (let i = 0; i < texto.length; i++) {
        let letra = texto.charAt(i);
        if (letra >= 'A' && letra <= 'Z') limpio += letra;
    }
    return limpio;
};

const completarTexto = (texto) => {
    return texto.length % 2 !== 0 ? texto + "X" : texto;
};

const convertirTextoANumeros = (texto) => {
    let numeros = [];
    for (let i = 0; i < texto.length; i++) {
        numeros.push(texto.charCodeAt(i) - 65);
    }
    return numeros;
};

const convertirNumerosATexto = (numeros) => {
    let texto = "";
    for (let i = 0; i < numeros.length; i++) {
        texto += String.fromCharCode(numeros[i] + 65);
    }
    return texto;
};

const cifrarMensaje = (mensaje, a, b, c, d) => {
    mensaje = completarTexto(limpiarTexto(mensaje));
    let numeros = convertirTextoANumeros(mensaje);
    let resultados = [];

    for (let i = 0; i < numeros.length; i += 2) {
        let v1 = numeros[i];
        let v2 = numeros[i + 1];

        resultados.push(modulo((a * v1) + (b * v2), 26));
        resultados.push(modulo((c * v1) + (d * v2), 26));
    }

    return convertirNumerosATexto(resultados);
};

const descifrarMensaje = (mensaje, a, b, c, d) => {
    let [invA, invB, invC, invD] = calcularMatrizInversa(a, b, c, d);

    mensaje = limpiarTexto(mensaje);
    let numeros = convertirTextoANumeros(mensaje);
    let resultados = [];

    for (let i = 0; i < numeros.length; i += 2) {
        let v1 = numeros[i];
        let v2 = numeros[i + 1];

        resultados.push(modulo((invA * v1) + (invB * v2), 26));
        resultados.push(modulo((invC * v1) + (invD * v2), 26));
    }

    return convertirNumerosATexto(resultados);
};
