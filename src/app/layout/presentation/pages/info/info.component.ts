import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-info',
    imports: [
        CommonModule,
        MatToolbarModule,
        MatIconModule,
    ],
    templateUrl: './info.component.html',
    styleUrl: './info.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoComponent {
  logs = [
    {
      icon: 'settings',
      version: '2.0.0',
      group: 'error',
      date: '30/04/2024',
      title:
        'Corrección de errores e implementación de nuevas vistas para reportes e información',
      description:
        "Implementación de la vista 'Notas de la versión', cambios en formato de reportes y corrección en cancelación de envío inicial.",
      activities: [
        'Implementación de menú lateral con reportes disponibles.',
        'Implementación de línea temporal con los cambios realizados.',
      ],
    },
    {
      icon: 'settings',
      version: '1.9.0',
      group: 'error',
      date: '20/02/2024',
      title:
        "Reestructuración del proyecto 'Seguimiento de trámites internos y externos'",
      description:
        'Reestructuración del esquema de base de datos, migración de Frontend y Backend a nueva versión de NodeJS.',
      activities: [
        'Migración backend (NodeJS - Express) al framework NestJS.',
        'Migración frontend Angular (V.14) a la nueva versión Angular (V.17).',
        'Creación de nuevos métodos para la administración de envíos, archivos y obtención de workflow.',
        'Implementación de transacciones (ACID) para el esquema de base de datos.',
        'Corrección en métodos de búsqueda de trámites.',
        'Creación de esquema basado en herencia para trámites externos e internos.',
      ],
    },
    {
      icon: 'settings',
      version: '1.1.0',
      group: 'error',
      date: '31/05/2023',
      title: "Cambio de estilo para 'Aniversario de Sacaba 262'",
      description: 'Modificaciones de estilo, fuentes y logo en vistas.',
      activities: [
        'Cambio de logo inicial Escudo de Sacaba.',
        'Cambio de color fondo inicio de sesión y navegación lateral.',
      ],
    },
    {
      icon: 'settings',
      version: '1.0.5',
      group: 'error',
      date: '24/05/2023',
      title: 'Implementación de envío a múltiples funcionarios',
      description:
        'Reestructuración del esquema de base de datos, corrección desarchivo de trámite y cambios en formato hoja de ruta, contenedores fuentes para PDF.',
      activities: [
        'Creación de nueva estructura de base de datos MongoDB (Modelo estructura de árbol con referencias principales).',
        'Implementación de nuevo método para eliminación y creación de esquema bandeja de entrada a esquema de archivos.',
        'Corrección en división de celdas para fechas de ingreso y salida en hoja de ruta.',
        'Cambio de posición para instrucción / proveído.',
      ],
    },
    {
      icon: 'settings',
      version: '0.9.0',
      group: 'error',
      date: '19/05/2023',
      title: 'Implementación de métodos para desarchivo',
      description:
        'Creación de métodos para administración de archivos y generación de eventos.',
      activities: [
        'Creación de esquema para archivos en MongoDB.',
        'Creación lógica de archivo y desarchivo de trámites.',
        'Implementación lógica de creación de eventos/logs para cada desarchivo.',
        'Creación de vista para la administración de archivados.',
      ],
    },
    {
      icon: 'settings',
      version: '0.8.0',
      group: 'error',
      date: '09/05/2023',
      title: 'Implementación de cancelación de envíos',
      description:
        'Creación de métodos, validaciones y alertas para eliminación de envío.',
      activities: [
        'Corrección lógica de workflow.',
        'Corrección cambio de ubicación.',
        'Implementación de validación para trámites aceptados.',
      ],
    },
    {
      icon: 'settings',
      version: '0.8.0',
      group: 'error',
      date: '28/04/2023',
      title: 'Implementación de observaciones para trámites',
      description:
        'Creación de esquemas y relaciones para el registro de observaciones.',
      activities: [
        'Creación de formulario para registro.',
        'Implementación de métodos y validaciones para el cambio de estado de los trámites.',
      ],
    },
    {
      icon: 'settings',
      version: '0.2.0',
      group: 'error',
      date: '02/01/2023',
      title: 'Corrección de validaciones en formularios',
      description:
        'Modificación de validaciones en formularios de registro con abreviaturas, guiones y espacios en blanco.',
      activities: [
        'Validación de puntos para nombres y apellidos.',
        'Eliminar validación de apellido materno.',
        'Eliminar campos de expedido.',
      ],
    },
    {
      icon: 'build',
      version: '0.1.1',
      group: 'repair',
      date: '01/12/2022',
      title: 'Migración de base de datos MySQL a MongoDB',
      description:
        'Reestructuración del proyecto con métodos y servicios para conexión y administración de esquemas.',
      activities: [
        'Diseño de estructura de base de datos.',
        'Creación de esquemas en MongoDB.',
        'Cambios de métodos para consultas.',
      ],
    },
    {
      icon: 'settings',
      version: '0.0.5',
      group: 'deploy',
      date: '18/08/2022',
      title: 'Implementación de nuevo tipo de trámite',
      description:
        'Modificación de estructura del proyecto para implementación de nuevo tipo de trámite.',
      activities: [
        'Creación de vistas, formularios y métodos para administración de trámites internos.',
        'Creación de nueva tabla para trámites internos.',
      ],
    },
    {
      icon: 'home',
      version: '0.0.1',
      group: 'error',
      date: '25/06/2022',
      title: 'Estructura inicial del proyecto',
      description:
        'Configuración inicial de rutas, controladores, servicios y conexión con base de datos.',
      activities: [
        'Creación de repositorio GitHub.',
        'Instalación de librerías necesarias.',
      ],
    },
  ];
}
