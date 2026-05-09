/**
 * Versión Corregida - Editor Inteligente de Imágenes
 * Sin dependencias externas, JavaScript vanilla puro
 */

/**
 * Clase corregida de Matrix
 */
class SimpleMatrix {
    constructor(data) {
        if (Array.isArray(data)) {
            this.data = data;
            this.rows = data.length;
            this.columns = data[0] ? data[0].length : 0;
        } else {
            this.rows = data.rows;
            this.columns = data.columns;
            this.data = Array(data.rows).fill().map(() => Array(data.columns).fill(0));
        }
    }
    
    get(i, j) {
        return this.data[i] && this.data[i][j];
    }
    
    set(i, j, value) {
        if (!this.data[i]) this.data[i] = [];
        this.data[i][j] = value;
    }
    
    clone() {
        return new SimpleMatrix(this.data.map(row => [...row]));
    }
    
    mmul(other) {
        const result = new SimpleMatrix({rows: this.rows, columns: other.columns});
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
        const result = new SimpleMatrix({rows: this.columns, columns: this.rows});
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
                min = Math.min(min, this.get(i, j));
            }
        }
        return min;
    }
    
    max() {
        let max = -Infinity;
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                max = Math.max(max, this.get(i, j));
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
        const result = new SimpleMatrix({rows: size, columns: size});
        for (let i = 0; i < size; i++) {
            result.set(i, i, 1);
        }
        return result;
    }
    
    static fill(rows, columns, value) {
        const result = new SimpleMatrix({rows: rows, columns: columns});
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                result.set(i, j, value);
            }
        }
        return result;
    }
    
    inverse() {
        // Para matrices 3x3, implementar inversa directa
        if (this.rows === 3 && this.columns === 3) {
            return this.inverse3x3();
        }
        // Para otros casos, devolver matriz identidad (simplificado)
        return SimpleMatrix.identity(this.rows);
    }
    
    inverse3x3() {
        const a = this.get(0, 0), b = this.get(0, 1), c = this.get(0, 2);
        const d = this.get(1, 0), e = this.get(1, 1), f = this.get(1, 2);
        const g = this.get(2, 0), h = this.get(2, 1), i = this.get(2, 2);
        
        const det = a*(e*i - f*h) - b*(d*i - f*g) + c*(d*h - e*g);
        
        if (Math.abs(det) < 1e-10) {
            return SimpleMatrix.identity(3);
        }
        
        const invDet = 1/det;
        
        const result = new SimpleMatrix({rows: 3, columns: 3});
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

/**
 * Operaciones matriciales corregidas
 */
class MatrixOperations {
    static imageToMatrix(imageData, channel = 'grayscale') {
        const { width, height, data } = imageData;
        const matrix = [];
        
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
            matrix.push(row);
        }
        
        return new SimpleMatrix(matrix);
    }
    
    static matrixToImage(matrix, width, height, channel = 'grayscale') {
        const imageData = new ImageData(width, height);
        const { data } = imageData;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                const value = Math.min(255, Math.max(0, Math.round(matrix.get(y, x))));
                
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
    
    static subtract(matrixA, matrixB) {
        const result = new SimpleMatrix({rows: matrixA.rows, columns: matrixA.columns});
        for (let i = 0; i < matrixA.rows; i++) {
            for (let j = 0; j < matrixA.columns; j++) {
                result.set(i, j, matrixA.get(i, j) - matrixB.get(i, j));
            }
        }
        return result;
    }
    
    static elementWiseOperation(matrix, operation) {
        const result = new SimpleMatrix({rows: matrix.rows, columns: matrix.columns});
        for (let i = 0; i < matrix.rows; i++) {
            for (let j = 0; j < matrix.columns; j++) {
                result.set(i, j, operation(matrix.get(i, j)));
            }
        }
        return result;
    }
    
    static normalize(matrix) {
        const min = matrix.min();
        const max = matrix.max();
        const range = max - min;
        
        if (range === 0) {
            return SimpleMatrix.fill(matrix.rows, matrix.columns, 0);
        }
        
        return this.elementWiseOperation(matrix, value => 
            ((value - min) / range) * 255
        );
    }
}

/**
 * Operaciones vectoriales corregidas
 */
class VectorOperations {
    static createVector2D(x, y) {
        return [x, y];
    }
    
    static createVector3D(x, y, w = 1) {
        return [x, y, w];
    }
    
    static magnitude(vector) {
        return Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    }
    
    static euclideanDistance(vectorA, vectorB) {
        const diff = vectorA.map((val, index) => val - vectorB[index]);
        return this.magnitude(diff);
    }
    
    static cosineSimilarity(vectorA, vectorB) {
        const dotProduct = vectorA.reduce((sum, val, index) => sum + val * vectorB[index], 0);
        const magA = this.magnitude(vectorA);
        const magB = this.magnitude(vectorB);
        
        if (magA === 0 || magB === 0) {
            return 0; // Devolver 0 en lugar de error
        }
        
        return dotProduct / (magA * magB);
    }
}

/**
 * Transformaciones lineales corregidas
 */
class LinearTransformations {
    static rotationMatrix2D(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        return new SimpleMatrix([
            [cos, -sin],
            [sin, cos]
        ]);
    }
    
    static scalingMatrix2D(scaleX, scaleY) {
        return new SimpleMatrix([
            [scaleX, 0],
            [0, scaleY]
        ]);
    }
    
    static scalingMatrix3D(scaleX, scaleY) {
        return new SimpleMatrix([
            [scaleX, 0, 0],
            [0, scaleY, 0],
            [0, 0, 1]
        ]);
    }
    
    static reflectionHorizontalMatrix3D() {
        return new SimpleMatrix([
            [-1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ]);
    }
    
    static reflectionVerticalMatrix3D() {
        return new SimpleMatrix([
            [1, 0, 0],
            [0, -1, 0],
            [0, 0, 1]
        ]);
    }
    
    static translationMatrix3D(translateX, translateY) {
        return new SimpleMatrix([
            [1, 0, translateX],
            [0, 1, translateY],
            [0, 0, 1]
        ]);
    }
    
    static combineTransformations(matrices) {
        if (matrices.length === 0) {
            return SimpleMatrix.identity(2);
        }
        
        let combined = matrices[0].clone();
        for (let i = 1; i < matrices.length; i++) {
            combined = combined.mmul(matrices[i]);
        }
        
        return combined;
    }
    
    static createCompositeTransform(params) {
        const transforms = [];
        
        if (params.scaleX !== undefined || params.scaleY !== undefined) {
            const sx = params.scaleX !== undefined ? params.scaleX : 1;
            const sy = params.scaleY !== undefined ? params.scaleY : 1;
            transforms.push(this.scalingMatrix3D(sx, sy));
        }
        
        if (params.rotation !== undefined) {
            transforms.push(this.rotationMatrix2D(params.rotation));
        }
        
        if (params.translateX !== undefined || params.translateY !== undefined) {
            const tx = params.translateX !== undefined ? params.translateX : 0;
            const ty = params.translateY !== undefined ? params.translateY : 0;
            transforms.push(this.translationMatrix3D(tx, ty));
        }
        
        if (transforms.length === 0) {
            return SimpleMatrix.identity(3);
        }
        
        return this.combineTransformations(transforms);
    }
    
    static transformPoint3D(point, transformMatrix) {
        const transformed = [
            transformMatrix.get(0, 0) * point[0] + transformMatrix.get(0, 1) * point[1] + transformMatrix.get(0, 2) * point[2],
            transformMatrix.get(1, 0) * point[0] + transformMatrix.get(1, 1) * point[1] + transformMatrix.get(1, 2) * point[2],
            transformMatrix.get(2, 0) * point[0] + transformMatrix.get(2, 1) * point[1] + transformMatrix.get(2, 2) * point[2]
        ];
        
        if (transformed[2] !== 0) {
            return [transformed[0] / transformed[2], transformed[1] / transformed[2], 1];
        }
        
        return transformed;
    }
    
    static transformImage(imageMatrix, transformMatrix, width, height) {
        // Para transformaciones 2D, usar mapeo directo
        if (transformMatrix.rows === 2 && transformMatrix.columns === 2) {
            return this.transformImage2D(imageMatrix, transformMatrix, width, height);
        }
        
        // Para transformaciones 3D, usar mapeo inverso
        const transformedMatrix = SimpleMatrix.fill(imageMatrix.rows, imageMatrix.columns, 0);
        const inverseTransform = transformMatrix.inverse();
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const point = VectorOperations.createVector3D(x, y, 1);
                const transformedPoint = this.transformPoint3D(point, inverseTransform);
                
                const sourceX = Math.round(transformedPoint[0]);
                const sourceY = Math.round(transformedPoint[1]);
                
                if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                    const value = imageMatrix.get(sourceY, sourceX);
                    transformedMatrix.set(y, x, value);
                }
            }
        }
        
        return transformedMatrix;
    }
    
    static transformImage2D(imageMatrix, transformMatrix, width, height) {
        const transformedMatrix = SimpleMatrix.fill(imageMatrix.rows, imageMatrix.columns, 0);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const point = VectorOperations.createVector2D(x, y);
                
                // Aplicar transformación directa
                const transformedX = transformMatrix.get(0, 0) * point[0] + transformMatrix.get(0, 1) * point[1];
                const transformedY = transformMatrix.get(1, 0) * point[0] + transformMatrix.get(1, 1) * point[1];
                
                const sourceX = Math.round(transformedX);
                const sourceY = Math.round(transformedY);
                
                if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                    const value = imageMatrix.get(sourceY, sourceX);
                    transformedMatrix.set(y, x, value);
                }
            }
        }
        
        return transformedMatrix;
    }
}

/**
 * Cargador de imágenes corregido
 */
class ImageLoader {
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
        const redMatrix = MatrixOperations.imageToMatrix(imageData, 'red');
        const greenMatrix = MatrixOperations.imageToMatrix(imageData, 'green');
        const blueMatrix = MatrixOperations.imageToMatrix(imageData, 'blue');
        const grayscaleMatrix = MatrixOperations.imageToMatrix(imageData, 'grayscale');
        
        return {
            red: redMatrix,
            green: greenMatrix,
            blue: blueMatrix,
            grayscale: grayscaleMatrix,
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
    
    static matricesToImageData(matrices, width, height, mode = 'color') {
        if (mode === 'grayscale') {
            return MatrixOperations.matrixToImage(matrices.grayscale, width, height, 'grayscale');
        } else {
            const imageData = new ImageData(width, height);
            const { data } = imageData;
            
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const index = (y * width + x) * 4;
                    
                    data[index] = Math.min(255, Math.max(0, Math.round(matrices.red.get(y, x))));
                    data[index + 1] = Math.min(255, Math.max(0, Math.round(matrices.green.get(y, x))));
                    data[index + 2] = Math.min(255, Math.max(0, Math.round(matrices.blue.get(y, x))));
                    data[index + 3] = 255;
                }
            }
            
            return imageData;
        }
    }
    
    static saveImage(canvas, filename, format = 'png') {
        const link = document.createElement('a');
        link.download = `${filename}.${format}`;
        link.href = canvas.toDataURL();
        link.click();
    }
}

/**
 * Filtros de imagen corregidos
 */
class ImageFilters {
    static applyBlur(imageMatrix, intensity = 3) {
        const kernelSize = 2 * intensity + 1;
        const kernel = [];
        const sigma = intensity / 3;
        
        // Crear kernel Gaussiano
        for (let y = 0; y < kernelSize; y++) {
            kernel[y] = [];
            for (let x = 0; x < kernelSize; x++) {
                const dx = x - intensity;
                const dy = y - intensity;
                const value = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
                kernel[y][x] = value;
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
        
        return this.convolve(imageMatrix, kernel);
    }
    
    static applySharpen(imageMatrix, strength = 1.0) {
        const kernel = [
            [0, -strength, 0],
            [-strength, 1 + 4 * strength, -strength],
            [0, -strength, 0]
        ];
        
        let result = this.convolve(imageMatrix, kernel);
        
        result = MatrixOperations.elementWiseOperation(result, value => 
            Math.max(0, Math.min(255, value))
        );
        
        return result;
    }
    
    static applyEdgeDetection(imageMatrix, threshold = 50) {
        // Kernel Sobel X
        const sobelX = [
            [-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1]
        ];
        
        // Kernel Sobel Y
        const sobelY = [
            [-1, -2, -1],
            [0, 0, 0],
            [1, 2, 1]
        ];
        
        const gx = this.convolve(imageMatrix, sobelX);
        const gy = this.convolve(imageMatrix, sobelY);
        
        const magnitude = SimpleMatrix.fill(imageMatrix.rows, imageMatrix.columns, 0);
        
        for (let y = 0; y < imageMatrix.rows; y++) {
            for (let x = 0; x < imageMatrix.columns; x++) {
                const gxValue = gx.get(y, x);
                const gyValue = gy.get(y, x);
                const mag = Math.sqrt(gxValue * gxValue + gyValue * gyValue);
                magnitude.set(y, x, mag);
            }
        }
        
        return MatrixOperations.elementWiseOperation(magnitude, value => 
            value > threshold ? 255 : 0
        );
    }
    
    static applyEmboss(imageMatrix, strength = 1.0) {
        const kernel = [
            [-2 * strength, -strength, 0],
            [-strength, strength, strength],
            [0, strength, 2 * strength]
        ];
        
        let result = this.convolve(imageMatrix, kernel);
        result = MatrixOperations.normalize(result);
        
        return result;
    }
    
    static applyGrayscale(matrices) {
        const grayscaleMatrix = MatrixOperations.imageToMatrix(matrices.original, 'grayscale');
        
        return {
            red: grayscaleMatrix.clone(),
            green: grayscaleMatrix.clone(),
            blue: grayscaleMatrix.clone(),
            alpha: new SimpleMatrix({rows: grayscaleMatrix.rows, columns: grayscaleMatrix.columns}).fill(255),
            grayscale: grayscaleMatrix
        };
    }
    
    static convolve(imageMatrix, kernel) {
        const kernelSize = kernel.length;
        const kernelCenter = Math.floor(kernelSize / 2);
        const result = SimpleMatrix.fill(imageMatrix.rows, imageMatrix.columns, 0);
        
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
}

/**
 * Clase principal del Editor Corregido
 */
class FixedImageEditor {
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
            if (btn.textContent.includes('Blur') || btn.textContent.includes('Sharpen') || 
                btn.textContent.includes('Edge') || btn.textContent.includes('Emboss') || 
                btn.textContent.includes('Grayscale')) {
                btn.addEventListener('click', () => this.applyFilter(btn.textContent.toLowerCase()));
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
                const imageData = await ImageLoader.loadImageFromFile(file);
                this.setImageData(imageData);
                this.showMessage('Imagen cargada exitosamente', 'success');
            } catch (error) {
                this.showMessage('Error al cargar la imagen: ' + error.message, 'error');
            }
        }
    }
    
    async loadSampleImage() {
        try {
            const sampleImageData = ImageLoader.createSampleImage(400, 400, 'gradient');
            const canvas = document.getElementById('originalCanvas');
            ImageLoader.drawImageDataToCanvas(sampleImageData, canvas);
            
            const matrices = ImageLoader.imageDataToMatrices(sampleImageData);
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
        
        ImageLoader.drawImageDataToCanvas(imageData.imageData, originalCanvas);
        ImageLoader.drawImageDataToCanvas(imageData.imageData, transformedCanvas);
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
            
            const transformParams = {
                rotation: rotation,
                scaleX: scaleX,
                scaleY: scaleY,
                translateX: translateX,
                translateY: translateY
            };
            
            this.currentTransform = LinearTransformations.createCompositeTransform(transformParams);
            
            const transformedMatrices = {};
            for (const channel in this.currentMatrices) {
                if (channel !== 'original') {
                    transformedMatrices[channel] = LinearTransformations.transformImage(
                        this.currentMatrices[channel],
                        this.currentTransform,
                        this.currentImage.width,
                        this.currentImage.height
                    );
                }
            }
            
            this.currentMatrices = transformedMatrices;
            this.updateTransformedImage();
            this.showMathematicalExplanation('transform', transformParams);
            this.showMessage('Transformación aplicada exitosamente', 'success');
            
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
            const transformMatrix = LinearTransformations.reflectionHorizontalMatrix3D();
            
            const transformedMatrices = {};
            for (const channel in this.currentMatrices) {
                if (channel !== 'original') {
                    transformedMatrices[channel] = LinearTransformations.transformImage(
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
            const transformMatrix = LinearTransformations.reflectionVerticalMatrix3D();
            
            const transformedMatrices = {};
            for (const channel in this.currentMatrices) {
                if (channel !== 'original') {
                    transformedMatrices[channel] = LinearTransformations.transformImage(
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
                    filterFunction = (matrix) => ImageFilters.applyBlur(matrix, 3);
                    break;
                case 'sharpen':
                    filterFunction = (matrix) => ImageFilters.applySharpen(matrix, 1.0);
                    break;
                case 'edge':
                    filterFunction = (matrix) => ImageFilters.applyEdgeDetection(matrix, 50);
                    break;
                case 'emboss':
                    filterFunction = (matrix) => ImageFilters.applyEmboss(matrix, 1.0);
                    break;
                case 'grayscale':
                    const grayscaleMatrix = ImageFilters.applyGrayscale(this.currentMatrices);
                    this.currentMatrices = grayscaleMatrix;
                    this.updateTransformedImage();
                    this.showMessage('Filtro de escala de grises aplicado', 'success');
                    return;
                default:
                    this.showMessage('Filtro no reconocido', 'error');
                    return;
            }
            
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
            
            for (let y = 0; y < matrix.rows; y++) {
                for (let x = 0; x < matrix.columns; x++) {
                    const value = matrix.get(y, x);
                    const normalized = range > 0 ? (value - min) / range : 0.5;
                    
                    // Simple grayscale visualization
                    const gray = Math.floor(normalized * 255);
                    ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
                    ctx.fillRect(x * 2, y * 2, 2, 2);
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
                    const diff = MatrixOperations.subtract(
                        this.currentMatrices[channel],
                        this.originalMatrices[channel]
                    );
                    differences[channel] = VectorOperations.magnitude(diff.to1DArray());
                }
            }
            
            const originalVector = this.originalMatrices.grayscale.to1DArray();
            const currentVector = this.currentMatrices.grayscale.to1DArray();
            
            const euclideanDistance = VectorOperations.euclideanDistance(originalVector, currentVector);
            const cosineSimilarity = VectorOperations.cosineSimilarity(originalVector, currentVector);
            
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
            ImageLoader.saveImage(canvas, 'imagen_transformada', 'png');
            this.showMessage('Imagen guardada exitosamente', 'success');
        } catch (error) {
            this.showMessage('Error al guardar imagen: ' + error.message, 'error');
        }
    }
    
    updateTransformedImage() {
        try {
            const imageData = ImageLoader.matricesToImageData(
                this.currentMatrices,
                this.currentImage.width,
                this.currentImage.height,
                'color'
            );
            
            const canvas = document.getElementById('transformedCanvas');
            ImageLoader.drawImageDataToCanvas(imageData, canvas);
            
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
            <p>Matriz de escala de grises</p>
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

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.imageEditor = new FixedImageEditor();
    
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
