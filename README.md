# EDITOR INTELIGENTE DE IMÁGENES BASADO EN TRANSFORMACIONES DE ÁLGEBRA LINEAL

## Descripción del Proyecto

Este proyecto universitario demuestra la aplicación práctica del álgebra lineal en el procesamiento digital de imágenes mediante transformaciones matriciales, operaciones vectoriales y convoluciones. El sistema permite cargar imágenes y aplicar transformaciones matemáticas explicando cada paso del proceso.

## Objetivos

- Representar imágenes como matrices numéricas
- Aplicar transformaciones lineales mediante multiplicación matricial
- Implementar operaciones con vectores y matrices
- Explicar matemáticamente cada transformación
- Visualizar cambios de píxeles en tiempo real
- Demostrar aplicaciones reales del álgebra lineal

## Estructura del Proyecto

```
/project
│
├── main.py                 # Punto de entrada principal
├── requirements.txt        # Dependencias del proyecto
├── README.md              # Este archivo
│
├── interface/             # Interfaz gráfica
│   ├── ui.py             # Ventana principal
│   └── controls.py       # Controles de transformación
│
├── algebra/              # Módulos de álgebra lineal
│   ├── matrices.py       # Operaciones matriciales
│   ├── vectors.py        # Operaciones vectoriales
│   ├── transformations.py # Transformaciones lineales
│   └── convolution.py    # Convoluciones y kernels
│
├── image_processing/     # Procesamiento de imágenes
│   ├── loader.py         # Carga y guardado
│   ├── filters.py        # Filtros matemáticos
│   ├── edge_detection.py # Detección de bordes
│   └── compression.py    # Compresión SVD
│
├── visualizations/       # Visualizaciones matemáticas
│   ├── matrix_view.py    # Vista de matrices
│   ├── vector_view.py    # Vista de vectores
│   └── graphs.py         # Gráficos matemáticos
│
├── assets/              # Recursos estáticos
├── exports/             # Imágenes exportadas
└── docs/               # Documentación universitaria
```

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   pip install -r requirements.txt
   ```

## Uso

Ejecutar el programa principal:
```bash
python main.py
```

## Características Principales

- **Carga de imágenes**: PNG, JPG
- **Transformaciones geométricas**: Rotación, escalado, reflexión, traslación
- **Filtros matemáticos**: Blur, sharpen, edge detection, emboss, grayscale
- **Visualización matemática**: Matrices, vectores, coordenadas
- **Compresión SVD**: Reducción dimensional avanzada
- **Comparación de imágenes**: Distancia euclidiana, similitud coseno

## Fundamentos Matemáticos

El proyecto se basa en los siguientes conceptos de álgebra lineal:

- Matrices como representación de imágenes
- Transformaciones lineales mediante multiplicación matricial
- Vectores para coordenadas de píxeles
- Convoluciones para procesamiento espacial
- Descomposición SVD para compresión

## Tecnologías Utilizadas

- **Python 3.8+**: Lenguaje principal
- **NumPy**: Operaciones matriciales
- **OpenCV**: Procesamiento de imágenes
- **Pillow**: Manipulación de imágenes
- **Matplotlib**: Visualizaciones
- **CustomTkinter**: Interfaz gráfica moderna

## Aplicaciones del Mundo Real

Este proyecto demuestra técnicas utilizadas en:
- Instagram y filtros de redes sociales
- Adobe Photoshop
- Cámaras digitales y smartphones
- Visión computacional
- Videojuegos y gráficos 3D
- Procesamiento multimedia

## Documentación

La documentación completa se encuentra en la carpeta `/docs/` incluyendo:
- Marco teórico
- Implementación detallada
- Resultados y conclusiones
- Casos de uso del mundo real
