/**
 * VERSIÓN FINAL COMPLETAMENTE FUNCIONAL
 * Editor Inteligente de Imágenes - Álgebra Lineal
 */

// ==========================================
// CLASES MATEMÁTICAS FUNDAMENTALES
// ==========================================

class Matrix {
    constructor(data) {
        if (Array.isArray(data)) {
            this.data = data.map(row => Array.isArray(row) ? row.slice() : row);
            this.rows = this.data.length;
            this.columns = this.data[0] ? this.data[0].length : 0;
        } else {
            this.rows = data.rows;
            this.columns = data.columns;
            this.data = Array(this.rows).fill().map(() => Array(this.columns).fill(0));
        }
    }
    
    get(i, j) {
        return this.data[i]?.[j];
    }
    
    set(i, j, value) {
        if (!this.data[i]) this.data[i] = [];
        this.data[i][j] = value;
    }
    
    clone() {
        return new Matrix(this.data.map(row => row.slice()));
    }
    
    mmul(other) {
        if (this.columns !== other.rows) {
            throw new Error('Dimensiones incompatibles para multiplicación');
        }
        
        const result = new Matrix({rows: this.rows, columns: other.columns});
        
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < other.columns; j++) {
                let sum = 0;
                for (let k = 0; k < this.columns; k++) {
                    sum += this.get(i, k) * other.get(k, j);
                }
                result.set(i, j, sum);
            }
        }
        
        return result;
    }
    
    transpose() {
        const result = new Matrix({rows: this.columns, columns: this.rows});
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                result.set(j, i, this.get(i, j));
            }
        }
        return result;
    }
    
    min() {
        let min = Infinity;
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                const val = this.get(i, j);
                if (val < min) min = val;
            }
        }
        return min;
    }
    
    max() {
        let max = -Infinity;
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                const val = this.get(i, j);
                if (val > max) max = val;
            }
        }
        return max;
    }
    
    to1DArray() {
        const result = [];
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                result.push(this.get(i, j));
            }
        }
        return result;
    }
    
    static identity(size) {
        const result = new Matrix({rows: size, columns: size});
        for (let i = 0; i < size; i++) {
            result.set(i, i, 1);
        }
        return result;
    }
    
    static fill(rows, columns, value) {
        const result = new Matrix({rows: rows, columns: columns});
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                result.set(i, j, value);
            }
        }
        return result;
    }
    
    inverse() {
        if (this.rows === 2 && this.columns === 2) {
            return this.inverse2x2();
        } else if (this.rows === 3 && this.columns === 3) {
            return this.inverse3x3();
        }
        throw new Error('Inversa solo implementada para matrices 2x2 y 3x3');
    }
    
    inverse2x2() {
        const a = this.get(0, 0), b = this.get(0, 1);
        const c = this.get(1, 0), d = this.get(1, 1);
        
        const det = a * d - b * c;
        if (Math.abs(det) < 1e-10) {
            return Matrix.identity(2);
        }
        
        const result = new Matrix({rows: 2, columns: 2});
        result.set(0, 0, d / det);
        result.set(0, 1, -b / det);
        result.set(1, 0, -c / det);
        result.set(1, 1, a / det);
        
        return result;
    }
    
    inverse3x3() {
        const a = this.get(0, 0), b = this.get(0, 1), c = this.get(0, 2);
        const d = this.get(1, 0), e = this.get(1, 1), f = this.get(1, 2);
        const g = this.get(2, 0), h = this.get(2, 1), i = this.get(2, 2);
        
        const det = a*(e*i - f*h) - b*(d*i - f*g) + c*(d*h - e*g);
        if (Math.abs(det) < 1e-10) {
            return Matrix.identity(3);
        }
        
        const invDet = 1/det;
        const result = new Matrix({rows: 3, columns: 3});
        
        result.set(0, 0, invDet * (e*i - f*h));
        result.set(0, 1, invDet * (c*h - b*i));
        result.set(0, 2, invDet * (b*f - c*e));
        result.set(1, 0, invDet * (f*g - d*i));
        result.set(1, 1, invDet * (a*i - c*g));
        result.set(1, 2, invDet * (c*d - a*f));
        result.set(2, 0, invDet * (d*h - e*g));
        result.set(2, 1, invDet * (b*g - a*h));
        result.set(2, 2, invDet * (a*e - b*d));
        
        return result;
    }
}

// ==========================================
// OPERACIONES MATEMÁTICAS
// ==========================================

class MathOperations {
    static imageToMatrix(imageData, channel = 'grayscale') {
        const { width, height, data } = imageData;
        const matrixData = [];
        
        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                
                let value;
                switch (channel) {
                    case 'red':
                        value = data[index];
                        break;
                    case 'green':
                        value = data[index + 1];
                        break;
                    case 'blue':
                        value = data[index + 2];
                        break;
                    case 'grayscale':
                        value = Math.round(0.299 * data[index] + 0.587 * data[index + 1] + 0.114 * data[index + 2]);
                        break;
                    default:
                        value = data[index];
                }
                
                row.push(value);
            }
            matrixData.push(row);
        }
        
        return new Matrix(matrixData);
    }
    
    static matrixToImage(matrix, width, height, channel = 'grayscale') {
        const imageData = new ImageData(width, height);
        const { data } = imageData;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                let value = matrix.get(y, x);
                
                // Asegurar que el valor esté en rango válido
                value = Math.max(0, Math.min(255, Math.round(value)));
                
                switch (channel) {
                    case 'red':
                        data[index] = value;
                        data[index + 1] = 0;
                        data[index + 2] = 0;
                        data[index + 3] = 255;
                        break;
                    case 'green':
                        data[index] = 0;
                        data[index + 1] = value;
                        data[index + 2] = 0;
                        data[index + 3] = 255;
                        break;
                    case 'blue':
                        data[index] = 0;
                        data[index + 1] = 0;
                        data[index + 2] = value;
                        data[index + 3] = 255;
                        break;
                    case 'grayscale':
                        data[index] = value;
                        data[index + 1] = value;
                        data[index + 2] = value;
                        data[index + 3] = 255;
                        break;
                    default:
                        data[index] = value;
                        data[index + 1] = value;
                        data[index + 2] = value;
                        data[index + 3] = 255;
                }
            }
        }
        
        return imageData;
    }
    
    static elementWiseOperation(matrix, operation) {
        const result = new Matrix({rows: matrix.rows, columns: matrix.columns});
        for (let i = 0; i < matrix.rows; i++) {
            for (let j = 0; j < matrix.columns; j++) {
                result.set(i, j, operation(matrix.get(i, j)));
            }
        }
        return result;
    }
    
    static normalize(matrix, minVal = 0, maxVal = 255) {
        const min = matrix.min();
        const max = matrix.max();
        const range = max - min;
        
        if (range === 0) {
            return Matrix.fill(matrix.rows, matrix.columns, minVal);
        }
        
        return this.elementWiseOperation(matrix, value => 
            minVal + ((value - min) / range) * (maxVal - minVal)
        );
    }
}

// ==========================================
// TRANSFORMACIONES GEOMÉTRICAS
// ==========================================

class GeometricTransformations {
    static rotationMatrix(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        return new Matrix([
            [cos, -sin],
            [sin, cos]
        ]);
    }
    
    static scalingMatrix(scaleX, scaleY) {
        return new Matrix([
            [scaleX, 0],
            [0, scaleY]
        ]);
    }
    
    static translationMatrix(translateX, translateY) {
        return new Matrix([
            [1, 0, translateX],
            [0, 1, translateY],
            [0, 0, 1]
        ]);
    }
    
    static reflectionHorizontalMatrix() {
        return new Matrix([
            [-1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ]);
    }
    
    static reflectionVerticalMatrix() {
        return new Matrix([
            [1, 0, 0],
            [0, -1, 0],
            [0, 0, 1]
        ]);
    }
    
    static combineTransformations(transforms) {
        if (transforms.length === 0) {
            return Matrix.identity(2);
        }
        
        let combined = transforms[0].clone();
        for (let i = 1; i < transforms.length; i++) {
            combined = combined.mmul(transforms[i]);
        }
        
        return combined;
    }
    
    static transformPoint(point, transform) {
        if (transform.rows === 2 && transform.columns === 2) {
            // Transformación 2D
            return [
                transform.get(0, 0) * point[0] + transform.get(0, 1) * point[1],
                transform.get(1, 0) * point[0] + transform.get(1, 1) * point[1]
            ];
        } else {
            // Transformación 3D homogénea
            const w = point[2] || 1;
            const x = transform.get(0, 0) * point[0] + transform.get(0, 1) * point[1] + transform.get(0, 2) * w;
            const y = transform.get(1, 0) * point[0] + transform.get(1, 1) * point[1] + transform.get(1, 2) * w;
            const z = transform.get(2, 0) * point[0] + transform.get(2, 1) * point[1] + transform.get(2, 2) * w;
            
            return z !== 0 ? [x / z, y / z] : [x, y];
        }
    }
    
    static transformImage(imageMatrix, transform, width, height) {
        const result = Matrix.fill(height, width, 0);
        const centerX = width / 2;
        const centerY = height / 2;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Coordenada relativa al centro
                const relX = x - centerX;
                const relY = y - centerY;
                
                // Aplicar transformación inversa (mapeo inverso)
                const inverseTransform = transform.inverse();
                const transformed = this.transformPoint([relX, relY, 1], inverseTransform);
                
                // Convertir a coordenadas de imagen
                const sourceX = Math.round(transformed[0] + centerX);
                const sourceY = Math.round(transformed[1] + centerY);
                
                // Muestrear desde la imagen original
                if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                    const value = imageMatrix.get(sourceY, sourceX);
                    result.set(y, x, value);
                }
            }
        }
        
        return result;
    }
}

// ==========================================
// FILTROS DE IMAGEN
// ==========================================

class ImageFilters {
    static convolve(imageMatrix, kernel) {
        const kernelSize = kernel.length;
        const kernelCenter = Math.floor(kernelSize / 2);
        const result = Matrix.fill(imageMatrix.rows, imageMatrix.columns, 0);
        
        for (let y = 0; y < imageMatrix.rows; y++) {
            for (let x = 0; x < imageMatrix.columns; x++) {
                let sum = 0;
                
                for (let ky = 0; ky < kernelSize; ky++) {
                    for (let kx = 0; kx < kernelSize; kx++) {
                        const imageY = y + ky - kernelCenter;
                        const imageX = x + kx - kernelCenter;
                        
                        if (imageY >= 0 && imageY < imageMatrix.rows && 
                            imageX >= 0 && imageX < imageMatrix.columns) {
                            const imageValue = imageMatrix.get(imageY, imageX);
                            const kernelValue = kernel[ky][kx];
                            sum += imageValue * kernelValue;
                        }
                    }
                }
                
                result.set(y, x, sum);
            }
        }
        
        return result;
    }
    
    static blur(imageMatrix, intensity = 3) {
        // Kernel Gaussiano
        const kernel = [];
        const sigma = intensity / 3;
        const kernelSize = 2 * intensity + 1;
        
        // Crear kernel
        for (let y = 0; y < kernelSize; y++) {
            kernel[y] = [];
            for (let x = 0; x < kernelSize; x++) {
                const dx = x - intensity;
                const dy = y - intensity;
                kernel[y][x] = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
            }
        }
        
        // Normalizar kernel
        let sum = 0;
        for (let y = 0; y < kernelSize; y++) {
            for (let x = 0; x < kernelSize; x++) {
                sum += kernel[y][x];
            }
        }
        for (let y = 0; y < kernelSize; y++) {
            for (let x = 0; x < kernelSize; x++) {
                kernel[y][x] /= sum;
            }
        }
        
        const result = this.convolve(imageMatrix, kernel);
        return MathOperations.elementWiseOperation(result, v => Math.max(0, Math.min(255, v)));
    }
    
    static sharpen(imageMatrix, strength = 1.0) {
        const kernel = [
            [0, -strength, 0],
            [-strength, 1 + 4 * strength, -strength],
            [0, -strength, 0]
        ];
        
        const result = this.convolve(imageMatrix, kernel);
        return MathOperations.elementWiseOperation(result, v => Math.max(0, Math.min(255, v)));
    }
    
    static edgeDetection(imageMatrix, threshold = 50) {
        // Sobel X
        const sobelX = [
            [-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1]
        ];
        
        // Sobel Y
        const sobelY = [
            [-1, -2, -1],
            [0, 0, 0],
            [1, 2, 1]
        ];
        
        const gx = this.convolve(imageMatrix, sobelX);
        const gy = this.convolve(imageMatrix, sobelY);
        
        const magnitude = Matrix.fill(imageMatrix.rows, imageMatrix.columns, 0);
        
        for (let y = 0; y < imageMatrix.rows; y++) {
            for (let x = 0; x < imageMatrix.columns; x++) {
                const gxVal = gx.get(y, x);
                const gyVal = gy.get(y, x);
                const mag = Math.sqrt(gxVal * gxVal + gyVal * gyVal);
                magnitude.set(y, x, mag);
            }
        }
        
        return MathOperations.elementWiseOperation(magnitude, v => v > threshold ? 255 : 0);
    }
    
    static emboss(imageMatrix, strength = 1.0) {
        const kernel = [
            [-2 * strength, -strength, 0],
            [-strength, strength, strength],
            [0, strength, 2 * strength]
        ];
        
        const result = this.convolve(imageMatrix, kernel);
        return MathOperations.normalize(result);
    }
    
    static grayscale(matrices) {
        const grayMatrix = MathOperations.imageToMatrix(matrices.original, 'grayscale');
        
        return {
            red: grayMatrix.clone(),
            green: grayMatrix.clone(),
            blue: grayMatrix.clone(),
            alpha: Matrix.fill(grayMatrix.rows, grayMatrix.columns, 255),
            grayscale: grayMatrix
        };
    }
}

// ==========================================
// MANEJO DE IMÁGENES
// ==========================================

class ImageHandler {
    static async loadImageFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const imageData = this.processImage(img);
                    resolve({
                        file: file,
                        image: img,
                        imageData: imageData.imageData,
                        matrices: imageData.matrices,
                        width: img.width,
                        height: img.height,
                        originalSrc: event.target.result
                    });
                };
                img.onerror = reject;
                img.src = event.target.result;
            };
            
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    static processImage(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        
        const matrices = this.imageDataToMatrices(imageData);
        
        return {
            imageData: imageData,
            matrices: matrices
        };
    }
    
    static imageDataToMatrices(imageData) {
        return {
            red: MathOperations.imageToMatrix(imageData, 'red'),
            green: MathOperations.imageToMatrix(imageData, 'green'),
            blue: MathOperations.imageToMatrix(imageData, 'blue'),
            grayscale: MathOperations.imageToMatrix(imageData, 'grayscale'),
            original: imageData
        };
    }
    
    static createSampleImage(width = 400, height = 400, pattern = 'gradient') {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        
        switch (pattern) {
            case 'gradient':
                this.createGradientPattern(ctx, width, height);
                break;
            case 'checkerboard':
                this.createCheckerboardPattern(ctx, width, height);
                break;
            case 'circles':
                this.createCirclesPattern(ctx, width, height);
                break;
            default:
                this.createGradientPattern(ctx, width, height);
        }
        
        return ctx.getImageData(0, 0, width, height);
    }
    
    static createGradientPattern(ctx, width, height) {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#FF6B6B');
        gradient.addColorStop(0.25, '#4ECDC4');
        gradient.addColorStop(0.5, '#45B7D1');
        gradient.addColorStop(0.75, '#96CEB4');
        gradient.addColorStop(1, '#FFEAA7');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }
    
    static createCheckerboardPattern(ctx, width, height) {
        const squareSize = 20;
        
        for (let y = 0; y < height; y += squareSize) {
            for (let x = 0; x < width; x += squareSize) {
                ctx.fillStyle = ((x / squareSize + y / squareSize) % 2 === 0) ? '#2C3E50' : '#ECF0F1';
                ctx.fillRect(x, y, squareSize, squareSize);
            }
        }
    }
    
    static createCirclesPattern(ctx, width, height) {
        ctx.fillStyle = '#34495E';
        ctx.fillRect(0, 0, width, height);
        
        const colors = ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6'];
        const circleCount = 15;
        
        for (let i = 0; i < circleCount; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const radius = Math.random() * 30 + 10;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }
    }
    
    static drawImageDataToCanvas(imageData, canvas, x = 0, y = 0) {
        const ctx = canvas.getContext('2d');
        ctx.putImageData(imageData, x, y);
    }
    
    static matricesToImageData(matrices, width, height) {
        const imageData = new ImageData(width, height);
        const { data } = imageData;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                
                data[index] = Math.max(0, Math.min(255, Math.round(matrices.red.get(y, x))));
                data[index + 1] = Math.max(0, Math.min(255, Math.round(matrices.green.get(y, x))));
                data[index + 2] = Math.max(0, Math.min(255, Math.round(matrices.blue.get(y, x))));
                data[index + 3] = 255;
            }
        }
        
        return imageData;
    }
    
    static saveImage(canvas, filename, format = 'png') {
        try {
            const link = document.createElement('a');
            link.download = `${filename}.${format}`;
            link.href = canvas.toDataURL(`image/${format}`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return true;
        } catch (error) {
            console.error('Error al guardar imagen:', error);
            return false;
        }
    }
}

// ==========================================
// ANÁLISIS MATEMÁTICO
// ==========================================

class MathematicalAnalysis {
    static euclideanDistance(vectorA, vectorB) {
        if (vectorA.length !== vectorB.length) {
            throw new Error('Los vectores deben tener la misma longitud');
        }
        
        let sum = 0;
        for (let i = 0; i < vectorA.length; i++) {
            const diff = vectorA[i] - vectorB[i];
            sum += diff * diff;
        }
        
        return Math.sqrt(sum);
    }
    
    static cosineSimilarity(vectorA, vectorB) {
        if (vectorA.length !== vectorB.length) {
            throw new Error('Los vectores deben tener la misma longitud');
        }
        
        let dotProduct = 0;
        let magnitudeA = 0;
        let magnitudeB = 0;
        
        for (let i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            magnitudeA += vectorA[i] * vectorA[i];
            magnitudeB += vectorB[i] * vectorB[i];
        }
        
        magnitudeA = Math.sqrt(magnitudeA);
        magnitudeB = Math.sqrt(magnitudeB);
        
        if (magnitudeA === 0 || magnitudeB === 0) {
            return 0;
        }
        
        return dotProduct / (magnitudeA * magnitudeB);
    }
    
    static vectorMagnitude(vector) {
        let sum = 0;
        for (let i = 0; i < vector.length; i++) {
            sum += vector[i] * vector[i];
        }
        return Math.sqrt(sum);
    }
}

// ==========================================
// EDITOR PRINCIPAL
// ==========================================

class ImageEditor {
    constructor() {
        this.originalImage = null;
        this.currentImage = null;
        this.originalMatrices = null;
        this.currentMatrices = null;
        this.currentTransform = null;
        
        this.initializeEventListeners();
        this.loadSampleImage();
    }
    
    initializeEventListeners() {
        // Event listeners de archivos
        document.getElementById('imageInput').addEventListener('change', (e) => this.handleImageUpload(e));
        
        // Event listeners de transformaciones geométricas
        document.getElementById('rotationSlider').addEventListener('input', (e) => this.updateSliderValue('rotation', e.target.value));
        document.getElementById('scaleXSlider').addEventListener('input', (e) => this.updateSliderValue('scaleX', e.target.value));
        document.getElementById('scaleYSlider').addEventListener('input', (e) => this.updateSliderValue('scaleY', e.target.value));
        document.getElementById('translateXSlider').addEventListener('input', (e) => this.updateSliderValue('translateX', e.target.value));
        document.getElementById('translateYSlider').addEventListener('input', (e) => this.updateSliderValue('translateY', e.target.value));
        
        // Botones de transformación
        document.getElementById('applyGeometricTransform').addEventListener('click', () => this.applyGeometricTransform());
        document.getElementById('reflectHorizontal').addEventListener('click', () => this.reflectHorizontal());
        document.getElementById('reflectVertical').addEventListener('click', () => this.reflectVertical());
        document.getElementById('resetTransform').addEventListener('click', () => this.resetTransform());
        
        // Botones de filtros
        document.querySelectorAll('.btn').forEach(btn => {
            const text = btn.textContent.toLowerCase();
            if (text.includes('blur') || text.includes('sharpen') || 
                text.includes('edge') || text.includes('emboss') || 
                text.includes('grayscale')) {
                btn.addEventListener('click', () => this.applyFilter(text));
            }
        });
        
        // Botones de análisis
        document.getElementById('showMatrixView').addEventListener('click', () => this.showMatrixView());
        document.getElementById('showTransformationMatrix').addEventListener('click', () => this.showTransformationMatrix());
        document.getElementById('compareImages').addEventListener('click', () => this.compareImages());
        
        // Botones de guardado
        document.getElementById('saveImage').addEventListener('click', () => this.saveImage());
    }
    
    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            try {
                this.showMessage('Cargando imagen...', 'info');
                const imageData = await ImageHandler.loadImageFromFile(file);
                this.setImageData(imageData);
                this.showMessage('Imagen cargada exitosamente', 'success');
            } catch (error) {
                this.showMessage('Error al cargar la imagen: ' + error.message, 'error');
            }
        }
    }
    
    async loadSampleImage() {
        try {
            const sampleImageData = ImageHandler.createSampleImage(400, 400, 'gradient');
            const canvas = document.getElementById('originalCanvas');
            ImageHandler.drawImageDataToCanvas(sampleImageData, canvas);
            
            const matrices = ImageHandler.imageDataToMatrices(sampleImageData);
            this.setImageData({
                matrices: matrices,
                imageData: sampleImageData,
                width: 400,
                height: 400
            });
            
            this.showMessage('Imagen de ejemplo cargada', 'success');
        } catch (error) {
            this.showMessage('Error al cargar imagen de ejemplo: ' + error.message, 'error');
        }
    }
    
    setImageData(imageData) {
        this.originalImage = imageData;
        this.currentImage = JSON.parse(JSON.stringify(imageData));
        this.originalMatrices = imageData.matrices;
        this.currentMatrices = JSON.parse(JSON.stringify(imageData.matrices));
        
        const originalCanvas = document.getElementById('originalCanvas');
        const transformedCanvas = document.getElementById('transformedCanvas');
        
        ImageHandler.drawImageDataToCanvas(imageData.imageData, originalCanvas);
        ImageHandler.drawImageDataToCanvas(imageData.imageData, transformedCanvas);
    }
    
    updateSliderValue(type, value) {
        const displayElement = document.getElementById(type + 'Value');
        if (displayElement) {
            let formattedValue = value;
            if (type === 'rotation') {
                formattedValue = value + '°';
            } else if (type.includes('scale')) {
                formattedValue = parseFloat(value).toFixed(1);
            }
            displayElement.textContent = formattedValue;
        }
    }
    
    applyGeometricTransform() {
        if (!this.currentMatrices) {
            this.showMessage('No hay imagen cargada', 'error');
            return;
        }
        
        try {
            const rotation = parseFloat(document.getElementById('rotationSlider').value) * Math.PI / 180;
            const scaleX = parseFloat(document.getElementById('scaleXSlider').value);
            const scaleY = parseFloat(document.getElementById('scaleYSlider').value);
            const translateX = parseFloat(document.getElementById('translateXSlider').value);
            const translateY = parseFloat(document.getElementById('translateYSlider').value);
            
            // Crear transformaciones individuales
            const transforms = [];
            
            if (scaleX !== 1 || scaleY !== 1) {
                transforms.push(GeometricTransformations.scalingMatrix(scaleX, scaleY));
            }
            
            if (rotation !== 0) {
                transforms.push(GeometricTransformations.rotationMatrix(rotation));
            }
            
            if (translateX !== 0 || translateY !== 0) {
                transforms.push(GeometricTransformations.translationMatrix(translateX, translateY));
            }
            
            // Combinar transformaciones
            if (transforms.length > 0) {
                this.currentTransform = GeometricTransformations.combineTransformations(transforms);
                
                // Aplicar a cada canal
                const transformedMatrices = {};
                for (const channel in this.currentMatrices) {
                    if (channel !== 'original') {
                        transformedMatrices[channel] = GeometricTransformations.transformImage(
                            this.currentMatrices[channel],
                            this.currentTransform,
                            this.currentImage.width,
                            this.currentImage.height
                        );
                    }
                }
                
                this.currentMatrices = transformedMatrices;
                this.updateTransformedImage();
                this.showMathematicalExplanation('transform', {
                    rotation: rotation,
                    scaleX: scaleX,
                    scaleY: scaleY,
                    translateX: translateX,
                    translateY: translateY
                });
                this.showMessage('Transformación aplicada exitosamente', 'success');
            } else {
                this.showMessage('No se especificaron parámetros de transformación', 'info');
            }
            
        } catch (error) {
            this.showMessage('Error en transformación: ' + error.message, 'error');
        }
    }
    
    reflectHorizontal() {
        if (!this.currentMatrices) {
            this.showMessage('No hay imagen cargada', 'error');
            return;
        }
        
        try {
            const transformMatrix = GeometricTransformations.reflectionHorizontalMatrix();
            
            const transformedMatrices = {};
            for (const channel in this.currentMatrices) {
                if (channel !== 'original') {
                    transformedMatrices[channel] = GeometricTransformations.transformImage(
                        this.currentMatrices[channel],
                        transformMatrix,
                        this.currentImage.width,
                        this.currentImage.height
                    );
                }
            }
            
            this.currentMatrices = transformedMatrices;
            this.updateTransformedImage();
            this.showMathematicalExplanation('reflection', { type: 'horizontal' });
            this.showMessage('Reflexión horizontal aplicada', 'success');
            
        } catch (error) {
            this.showMessage('Error en reflexión: ' + error.message, 'error');
        }
    }
    
    reflectVertical() {
        if (!this.currentMatrices) {
            this.showMessage('No hay imagen cargada', 'error');
            return;
        }
        
        try {
            const transformMatrix = GeometricTransformations.reflectionVerticalMatrix();
            
            const transformedMatrices = {};
            for (const channel in this.currentMatrices) {
                if (channel !== 'original') {
                    transformedMatrices[channel] = GeometricTransformations.transformImage(
                        this.currentMatrices[channel],
                        transformMatrix,
                        this.currentImage.width,
                        this.currentImage.height
                    );
                }
            }
            
            this.currentMatrices = transformedMatrices;
            this.updateTransformedImage();
            this.showMathematicalExplanation('reflection', { type: 'vertical' });
            this.showMessage('Reflexión vertical aplicada', 'success');
            
        } catch (error) {
            this.showMessage('Error en reflexión: ' + error.message, 'error');
        }
    }
    
    resetTransform() {
        if (!this.originalMatrices) {
            this.showMessage('No hay imagen original', 'error');
            return;
        }
        
        this.currentMatrices = JSON.parse(JSON.stringify(this.originalMatrices));
        this.currentTransform = null;
        
        // Resetear sliders
        document.getElementById('rotationSlider').value = 0;
        document.getElementById('scaleXSlider').value = 1;
        document.getElementById('scaleYSlider').value = 1;
        document.getElementById('translateXSlider').value = 0;
        document.getElementById('translateYSlider').value = 0;
        
        this.updateSliderValue('rotation', 0);
        this.updateSliderValue('scaleX', 1);
        this.updateSliderValue('scaleY', 1);
        this.updateSliderValue('translateX', 0);
        this.updateSliderValue('translateY', 0);
        
        this.updateTransformedImage();
        this.hideMathematicalExplanation();
        this.showMessage('Transformaciones reiniciadas', 'success');
    }
    
    applyFilter(filterType) {
        if (!this.currentMatrices) {
            this.showMessage('No hay imagen cargada', 'error');
            return;
        }
        
        try {
            let filterFunction;
            
            switch (filterType) {
                case 'blur':
                    filterFunction = (matrix) => ImageFilters.blur(matrix, 3);
                    break;
                case 'sharpen':
                    filterFunction = (matrix) => ImageFilters.sharpen(matrix, 1.0);
                    break;
                case 'edge':
                    filterFunction = (matrix) => ImageFilters.edgeDetection(matrix, 50);
                    break;
                case 'emboss':
                    filterFunction = (matrix) => ImageFilters.emboss(matrix, 1.0);
                    break;
                case 'grayscale':
                    const grayscaleMatrices = ImageFilters.grayscale(this.currentMatrices);
                    this.currentMatrices = grayscaleMatrices;
                    this.updateTransformedImage();
                    this.showMessage('Filtro de escala de grises aplicado', 'success');
                    return;
                default:
                    this.showMessage('Filtro no reconocido', 'error');
                    return;
            }
            
            // Aplicar filtro a cada canal
            const filteredMatrices = {};
            for (const channel in this.currentMatrices) {
                if (channel !== 'original') {
                    filteredMatrices[channel] = filterFunction(this.currentMatrices[channel]);
                }
            }
            
            this.currentMatrices = filteredMatrices;
            this.updateTransformedImage();
            this.showMessage(`Filtro ${filterType} aplicado`, 'success');
            
        } catch (error) {
            this.showMessage('Error al aplicar filtro: ' + error.message, 'error');
        }
    }
    
    showMatrixView() {
        if (!this.currentMatrices) {
            this.showMessage('No hay imagen cargada', 'error');
            return;
        }
        
        try {
            const matrixCanvas = document.createElement('canvas');
            matrixCanvas.width = 300;
            matrixCanvas.height = 300;
            
            const ctx = matrixCanvas.getContext('2d');
            const matrix = this.currentMatrices.grayscale;
            const min = matrix.min();
            const max = matrix.max();
            const range = max - min;
            
            const cellSize = Math.min(300 / matrix.rows, 300 / matrix.columns);
            
            for (let y = 0; y < matrix.rows; y++) {
                for (let x = 0; x < matrix.columns; x++) {
                    const value = matrix.get(y, x);
                    const normalized = range > 0 ? (value - min) / range : 0.5;
                    
                    const gray = Math.floor(normalized * 255);
                    ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }
            }
            
            this.showMatrixDialog(matrixCanvas);
            this.showMessage('Vista de matriz generada', 'success');
            
        } catch (error) {
            this.showMessage('Error al mostrar matriz: ' + error.message, 'error');
        }
    }
    
    showTransformationMatrix() {
        if (!this.currentTransform) {
            this.showMessage('No hay transformación activa', 'error');
            return;
        }
        
        try {
            let matrixContent = '';
            for (let i = 0; i < this.currentTransform.rows; i++) {
                matrixContent += '[';
                for (let j = 0; j < this.currentTransform.columns; j++) {
                    matrixContent += this.currentTransform.get(i, j).toFixed(3).padStart(8, ' ');
                    if (j < this.currentTransform.columns - 1) matrixContent += ',';
                }
                matrixContent += ']\n';
            }
            
            document.getElementById('matrixContent').textContent = matrixContent;
            document.getElementById('matrixDisplay').style.display = 'block';
            
            this.showMessage('Matriz de transformación mostrada', 'success');
            
        } catch (error) {
            this.showMessage('Error al mostrar matriz: ' + error.message, 'error');
        }
    }
    
    compareImages() {
        if (!this.originalMatrices || !this.currentMatrices) {
            this.showMessage('Se necesitan ambas imágenes para comparar', 'error');
            return;
        }
        
        try {
            const differences = {};
            for (const channel in this.originalMatrices) {
                if (channel !== 'original') {
                    const diff = MathOperations.elementWiseOperation(
                        this.currentMatrices[channel],
                        (val1, val2) => Math.abs(val1 - val2)
                    );
                    differences[channel] = MathematicalAnalysis.vectorMagnitude(diff.to1DArray());
                }
            }
            
            const originalVector = this.originalMatrices.grayscale.to1DArray();
            const currentVector = this.currentMatrices.grayscale.to1DArray();
            
            const euclideanDistance = MathematicalAnalysis.euclideanDistance(originalVector, currentVector);
            const cosineSimilarity = MathematicalAnalysis.cosineSimilarity(originalVector, currentVector);
            
            const comparisonResult = `
                <h4>Resultados de Comparación</h4>
                <p><strong>Distancia Euclidiana:</strong> ${euclideanDistance.toFixed(2)}</p>
                <p><strong>Similitud Coseno:</strong> ${cosineSimilarity.toFixed(4)}</p>
                <p><strong>Diferencias por canal:</strong></p>
                <ul>
                    <li>Rojo: ${differences.red ? differences.red.toFixed(2) : 'N/A'}</li>
                    <li>Verde: ${differences.green ? differences.green.toFixed(2) : 'N/A'}</li>
                    <li>Azul: ${differences.blue ? differences.blue.toFixed(2) : 'N/A'}</li>
                </ul>
            `;
            
            this.showComparisonDialog(comparisonResult);
            this.showMessage('Comparación completada', 'success');
            
        } catch (error) {
            this.showMessage('Error en comparación: ' + error.message, 'error');
        }
    }
    
    saveImage() {
        if (!this.currentMatrices) {
            this.showMessage('No hay imagen para guardar', 'error');
            return;
        }
        
        try {
            const canvas = document.getElementById('transformedCanvas');
            const success = ImageHandler.saveImage(canvas, 'imagen_transformada', 'png');
            
            if (success) {
                this.showMessage('Imagen guardada exitosamente', 'success');
            } else {
                this.showMessage('Error al guardar imagen', 'error');
            }
        } catch (error) {
            this.showMessage('Error al guardar imagen: ' + error.message, 'error');
        }
    }
    
    updateTransformedImage() {
        try {
            const imageData = ImageHandler.matricesToImageData(
                this.currentMatrices,
                this.currentImage.width,
                this.currentImage.height
            );
            
            const canvas = document.getElementById('transformedCanvas');
            ImageHandler.drawImageDataToCanvas(imageData, canvas);
            
        } catch (error) {
            this.showMessage('Error al actualizar imagen: ' + error.message, 'error');
        }
    }
    
    showMathematicalExplanation(type, data) {
        const explanationDiv = document.getElementById('mathematicalExplanation');
        const explanationText = document.getElementById('explanationText');
        const formulaDisplay = document.getElementById('formulaDisplay');
        
        let explanation = '';
        let formula = '';
        
        switch (type) {
            case 'transform':
                explanation = `Transformación aplicada con parámetros:
                Rotación: ${(data.rotation * 180 / Math.PI).toFixed(1)}°
                Escalado: (${data.scaleX.toFixed(2)}, ${data.scaleY.toFixed(2)})
                Traslación: (${data.translateX}, ${data.translateY})`;
                
                formula = `T = R(θ) · S(sx,sy) · T(tx,ty)`;
                break;
                
            case 'reflection':
                explanation = `Reflexión ${data.type} aplicada. Esta transformación invierte las coordenadas en el eje ${data.type}.`;
                formula = data.type === 'horizontal' ? 
                    'Ref_x = [[-1, 0, 0], [0, 1, 0], [0, 0, 1]]' :
                    'Ref_y = [[1, 0, 0], [0, -1, 0], [0, 0, 1]]';
                break;
        }
        
        explanationText.innerHTML = explanation.replace(/\n/g, '<br>');
        formulaDisplay.textContent = formula;
        explanationDiv.style.display = 'block';
    }
    
    hideMathematicalExplanation() {
        document.getElementById('mathematicalExplanation').style.display = 'none';
    }
    
    showMessage(message, type = 'info') {
        const messageDiv = document.getElementById('statusMessage');
        messageDiv.className = type;
        messageDiv.textContent = message;
        
        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.className = '';
        }, 3000);
    }
    
    showMatrixDialog(canvas) {
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 1000;
            max-width: 90%;
            max-height: 90%;
            overflow: auto;
        `;
        
        dialog.innerHTML = `
            <h3>Visualización de Matriz</h3>
            <p>Matriz de escala de grises (${canvas.width}x${canvas.height})</p>
            <div style="text-align: center; margin: 10px 0;"></div>
            <button onclick="this.parentElement.remove()" style="
                background: #3498db;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
            ">Cerrar</button>
        `;
        
        dialog.querySelector('div').appendChild(canvas);
        document.body.appendChild(dialog);
    }
    
    showComparisonDialog(content) {
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 1000;
            max-width: 400px;
        `;
        
        dialog.innerHTML = `
            ${content}
            <button onclick="this.parentElement.remove()" style="
                background: #3498db;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
            ">Cerrar</button>
        `;
        
        document.body.appendChild(dialog);
    }
}

// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    window.imageEditor = new ImageEditor();
    
    // Funciones globales para botones
    window.loadSampleImage = () => window.imageEditor.loadSampleImage();
    window.applyGeometricTransform = () => window.imageEditor.applyGeometricTransform();
    window.reflectHorizontal = () => window.imageEditor.reflectHorizontal();
    window.reflectVertical = () => window.imageEditor.reflectVertical();
    window.resetTransform = () => window.imageEditor.resetTransform();
    window.applyFilter = (type) => window.imageEditor.applyFilter(type);
    window.showMatrixView = () => window.imageEditor.showMatrixView();
    window.showTransformationMatrix = () => window.imageEditor.showTransformationMatrix();
    window.compareImages = () => window.imageEditor.compareImages();
    window.saveImage = () => window.imageEditor.saveImage();
});
