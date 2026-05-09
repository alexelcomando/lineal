/**
 * Módulo de Operaciones Vectoriales
 * Implementación de operaciones fundamentales con vectores
 * para transformaciones geométricas y procesamiento de imágenes
 */

export class VectorOperations {
    /**
     * Crea un vector 2D
     * @param {number} x - Coordenada X
     * @param {number} y - Coordenada Y
     * @returns {Array} Vector [x, y]
     */
    static createVector2D(x, y) {
        return [x, y];
    }
    
    /**
     * Crea un vector 3D (para coordenadas homogéneas)
     * @param {number} x - Coordenada X
     * @param {number} y - Coordenada Y
     * @param {number} w - Componente homogénea (default: 1)
     * @returns {Array} Vector [x, y, w]
     */
    static createVector3D(x, y, w = 1) {
        return [x, y, w];
    }
    
    /**
     * Suma dos vectores
     * @param {Array} vectorA - Primer vector
     * @param {Array} vectorB - Segundo vector
     * @returns {Array} Vector suma
     */
    static add(vectorA, vectorB) {
        if (vectorA.length !== vectorB.length) {
            throw new Error('Los vectores deben tener la misma dimensión');
        }
        
        return vectorA.map((value, index) => value + vectorB[index]);
    }
    
    /**
     * Resta dos vectores (A - B)
     * @param {Array} vectorA - Primer vector
     * @param {Array} vectorB - Segundo vector
     * @returns {Array} Vector resta
     */
    static subtract(vectorA, vectorB) {
        if (vectorA.length !== vectorB.length) {
            throw new Error('Los vectores deben tener la misma dimensión');
        }
        
        return vectorA.map((value, index) => value - vectorB[index]);
    }
    
    /**
     * Multiplica un vector por un escalar
     * @param {Array} vector - Vector original
     * @param {number} scalar - Escalar
     * @returns {Array} Vector escalado
     */
    static scalarMultiply(vector, scalar) {
        return vector.map(value => value * scalar);
    }
    
    /**
     * Calcula el producto punto (dot product)
     * @param {Array} vectorA - Primer vector
     * @param {Array} vectorB - Segundo vector
     * @returns {number} Producto punto
     */
    static dotProduct(vectorA, vectorB) {
        if (vectorA.length !== vectorB.length) {
            throw new Error('Los vectores deben tener la misma dimensión');
        }
        
        return vectorA.reduce((sum, value, index) => sum + value * vectorB[index], 0);
    }
    
    /**
     * Calcula el producto cruz (cross product) para vectores 3D
     * @param {Array} vectorA - Primer vector 3D
     * @param {Array} vectorB - Segundo vector 3D
     * @returns {Array} Vector resultado 3D
     */
    static crossProduct(vectorA, vectorB) {
        if (vectorA.length !== 3 || vectorB.length !== 3) {
            throw new Error('Ambos vectores deben ser de dimensión 3');
        }
        
        return [
            vectorA[1] * vectorB[2] - vectorA[2] * vectorB[1],
            vectorA[2] * vectorB[0] - vectorA[0] * vectorB[2],
            vectorA[0] * vectorB[1] - vectorA[1] * vectorB[0]
        ];
    }
    
    /**
     * Calcula la magnitud (norma) de un vector
     * @param {Array} vector - Vector
     * @param {string} type - Tipo de norma: 'euclidean', 'manhattan', 'infinity'
     * @returns {number} Magnitud del vector
     */
    static magnitude(vector, type = 'euclidean') {
        switch (type) {
            case 'euclidean':
                return Math.sqrt(this.dotProduct(vector, vector));
            case 'manhattan':
                return vector.reduce((sum, value) => sum + Math.abs(value), 0);
            case 'infinity':
                return Math.max(...vector.map(value => Math.abs(value)));
            default:
                throw new Error(`Tipo de norma no soportado: ${type}`);
        }
    }
    
    /**
     * Normaliza un vector (magnitud = 1)
     * @param {Array} vector - Vector a normalizar
     * @returns {Array} Vector unitario
     */
    static normalize(vector) {
        const mag = this.magnitude(vector);
        if (mag === 0) {
            throw new Error('No se puede normalizar el vector cero');
        }
        return this.scalarMultiply(vector, 1 / mag);
    }
    
    /**
     * Calcula el ángulo entre dos vectores en radianes
     * @param {Array} vectorA - Primer vector
     * @param {Array} vectorB - Segundo vector
     * @returns {number} Ángulo en radianes
     */
    static angleBetween(vectorA, vectorB) {
        const dotProduct = this.dotProduct(vectorA, vectorB);
        const magA = this.magnitude(vectorA);
        const magB = this.magnitude(vectorB);
        
        if (magA === 0 || magB === 0) {
            throw new Error('No se puede calcular el ángulo con vectores cero');
        }
        
        const cosAngle = dotProduct / (magA * magB);
        // Asegurar que el valor esté en el rango válido para arccos
        const clampedCos = Math.max(-1, Math.min(1, cosAngle));
        return Math.acos(clampedCos);
    }
    
    /**
     * Proyecta un vector sobre otro
     * @param {Array} vector - Vector a proyectar
     * @param {Array} onto - Vector sobre el cual proyectar
     * @returns {Array} Vector proyectado
     */
    static projection(vector, onto) {
        const dotProduct = this.dotProduct(vector, onto);
        const ontoSquared = this.dotProduct(onto, onto);
        
        if (ontoSquared === 0) {
            throw new Error('No se puede proyectar sobre el vector cero');
        }
        
        return this.scalarMultiply(onto, dotProduct / ontoSquared);
    }
    
    /**
     * Calcula la componente ortogonal de un vector
     * @param {Array} vector - Vector original
     * @param {Array} onto - Vector sobre el cual se proyecta
     * @returns {Array} Componente ortogonal
     */
    static orthogonalComponent(vector, onto) {
        const projection = this.projection(vector, onto);
        return this.subtract(vector, projection);
    }
    
    /**
     * Verifica si dos vectores son paralelos
     * @param {Array} vectorA - Primer vector
     * @param {Array} vectorB - Segundo vector
     * @param {number} tolerance - Tolerancia para comparación
     * @returns {boolean} True si son paralelos
     */
    static areParallel(vectorA, vectorB, tolerance = 1e-10) {
        if (this.magnitude(vectorA) === 0 || this.magnitude(vectorB) === 0) {
            return false;
        }
        
        try {
            const crossProduct = vectorA.length === 3 && vectorB.length === 3 
                ? this.magnitude(this.crossProduct(vectorA, vectorB))
                : Math.abs(vectorA[0] * vectorB[1] - vectorA[1] * vectorB[0]);
            
            return crossProduct < tolerance;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Verifica si dos vectores son ortogonales
     * @param {Array} vectorA - Primer vector
     * @param {Array} vectorB - Segundo vector
     * @param {number} tolerance - Tolerancia para comparación
     * @returns {boolean} True si son ortogonales
     */
    static areOrthogonal(vectorA, vectorB, tolerance = 1e-10) {
        return Math.abs(this.dotProduct(vectorA, vectorB)) < tolerance;
    }
    
    /**
     * Calcula la distancia euclidiana entre dos puntos
     * @param {Array} pointA - Primer punto
     * @param {Array} pointB - Segundo punto
     * @returns {number} Distancia euclidiana
     */
    static euclideanDistance(pointA, pointB) {
        return this.magnitude(this.subtract(pointA, pointB));
    }
    
    /**
     * Calcula la distancia de Manhattan entre dos puntos
     * @param {Array} pointA - Primer punto
     * @param {Array} pointB - Segundo punto
     * @returns {number} Distancia de Manhattan
     */
    static manhattanDistance(pointA, pointB) {
        const diff = this.subtract(pointA, pointB);
        return this.magnitude(diff, 'manhattan');
    }
    
    /**
     * Calcula la similitud de coseno entre dos vectores
     * @param {Array} vectorA - Primer vector
     * @param {Array} vectorB - Segundo vector
     * @returns {number} Similitud de coseno (-1 a 1)
     */
    static cosineSimilarity(vectorA, vectorB) {
        const dotProduct = this.dotProduct(vectorA, vectorB);
        const magA = this.magnitude(vectorA);
        const magB = this.magnitude(vectorB);
        
        if (magA === 0 || magB === 0) {
            throw new Error('No se puede calcular similitud con vectores cero');
        }
        
        return dotProduct / (magA * magB);
    }
    
    /**
     * Interpola linealmente entre dos vectores
     * @param {Array} vectorA - Vector inicial
     * @param {Array} vectorB - Vector final
     * @param {number} t - Factor de interpolación (0 a 1)
     * @returns {Array} Vector interpolado
     */
    static lerp(vectorA, vectorB, t) {
        if (vectorA.length !== vectorB.length) {
            throw new Error('Los vectores deben tener la misma dimensión');
        }
        
        t = Math.max(0, Math.min(1, t)); // Clamp t to [0, 1]
        return vectorA.map((value, index) => 
            value + t * (vectorB[index] - value)
        );
    }
    
    /**
     * Rota un vector 2D
     * @param {Array} vector - Vector 2D [x, y]
     * @param {number} angle - Ángulo de rotación en radianes
     * @returns {Array} Vector rotado
     */
    static rotate2D(vector, angle) {
        if (vector.length !== 2) {
            throw new Error('El vector debe ser de dimensión 2');
        }
        
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        return [
            cos * vector[0] - sin * vector[1],
            sin * vector[0] + cos * vector[1]
        ];
    }
    
    /**
     * Convierte coordenadas de píxel a coordenadas normalizadas
     * @param {Array} pixelCoords - Coordenadas de píxel [x, y]
     * @param {number} width - Ancho de la imagen
     * @param {number} height - Alto de la imagen
     * @returns {Array} Coordenadas normalizadas [-1, 1]
     */
    static pixelToNormalized(pixelCoords, width, height) {
        return [
            (pixelCoords[0] / width) * 2 - 1,
            1 - (pixelCoords[1] / height) * 2
        ];
    }
    
    /**
     * Convierte coordenadas normalizadas a coordenadas de píxel
     * @param {Array} normalizedCoords - Coordenadas normalizadas [-1, 1]
     * @param {number} width - Ancho de la imagen
     * @param {number} height - Alto de la imagen
     * @returns {Array} Coordenadas de píxel [x, y]
     */
    static normalizedToPixel(normalizedCoords, width, height) {
        return [
            ((normalizedCoords[0] + 1) / 2) * width,
            ((1 - normalizedCoords[1]) / 2) * height
        ];
    }
    
    /**
     * Formatea un vector para visualización
     * @param {Array} vector - Vector a formatear
     * @param {number} precision - Número de decimales
     * @returns {string} Representación formateada
     */
    static formatVector(vector, precision = 2) {
        const formatted = vector.map(value => value.toFixed(precision));
        return `[${formatted.join(', ')}]`;
    }
    
    /**
     * Crea un vector de ceros
     * @param {number} dimension - Dimensión del vector
     * @returns {Array} Vector de ceros
     */
    static zeros(dimension) {
        return new Array(dimension).fill(0);
    }
    
    /**
     * Crea un vector de unos
     * @param {number} dimension - Dimensión del vector
     * @returns {Array} Vector de unos
     */
    static ones(dimension) {
        return new Array(dimension).fill(1);
    }
    
    /**
     * Verifica si un vector es el vector cero
     * @param {Array} vector - Vector a verificar
     * @param {number} tolerance - Tolerancia para comparación
     * @returns {boolean} True si es vector cero
     */
    static isZeroVector(vector, tolerance = 1e-10) {
        return vector.every(value => Math.abs(value) < tolerance);
    }
}
