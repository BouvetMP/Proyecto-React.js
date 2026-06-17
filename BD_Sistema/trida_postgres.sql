SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'TriDa'
  AND pid <> pg_backend_pid();

DROP DATABASE IF EXISTS "TriDa";

CREATE DATABASE "TriDa"
WITH
    ENCODING = 'UTF8'
    TEMPLATE = template0;

\connect "TriDa"

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS trida;

SET search_path TO trida, public;

CREATE TABLE trida.bancos (
    id_banco        SERIAL PRIMARY KEY,
    codigo          VARCHAR(50) UNIQUE NOT NULL,
    nombre          VARCHAR(120) NOT NULL,
    color           VARCHAR(20) NOT NULL,
    estado          BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO trida.bancos (codigo, nombre, color)
VALUES
    ('sin_asignar', 'Sin banco asignado', '#6366F1'),
    ('bancolombia', 'Bancolombia', '#FFD700'),
    ('davivienda', 'Davivienda', '#E31837'),
    ('bogota', 'Banco de Bogotá', '#003DA5'),
    ('bbva', 'BBVA Colombia', '#004481'),
    ('avvillas', 'AV Villas', '#00A651'),
    ('nequi', 'Nequi', '#7B2D8E'),
    ('daviplata', 'Daviplata', '#FF6B00'),
    ('scotiabank', 'Scotiabank Colpatria', '#EC111A'),
    ('occidente', 'Banco de Occidente', '#006341'),
    ('popular', 'Banco Popular', '#0072CE'),
    ('falabella', 'Banco Falabella', '#00A650');

CREATE TABLE trida.clientes (
    id_cliente          SERIAL PRIMARY KEY,
    id_banco            INTEGER NOT NULL DEFAULT 1
                            REFERENCES trida.bancos (id_banco)
                            ON UPDATE CASCADE
                            ON DELETE RESTRICT,
    nombre_completo     VARCHAR(150) NOT NULL,
    email               VARCHAR(254) NOT NULL UNIQUE,
    telefono            VARCHAR(20) NOT NULL,
    fecha_registro      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    estado              BOOLEAN NOT NULL DEFAULT TRUE,
    pais                VARCHAR(100) NOT NULL,
    ciudad              VARCHAR(100) NOT NULL,
    CONSTRAINT chk_clientes_email_formato CHECK (
        email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    )
);

CREATE TABLE trida.usuarios_sistemas (
    id_usuario              SERIAL PRIMARY KEY,
    nombre_completo         VARCHAR(150) NOT NULL,
    email                   VARCHAR(254) NOT NULL UNIQUE,
    password_hash           TEXT NOT NULL,
    rol                     VARCHAR(30) NOT NULL,
    fecha_creacion          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ultimo_acceso           TIMESTAMPTZ,
    estado                  BOOLEAN NOT NULL DEFAULT TRUE,
    id_usuario_generador    INTEGER REFERENCES trida.usuarios_sistemas (id_usuario),
    CONSTRAINT chk_usuarios_email_formato CHECK (
        email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    ),
    CONSTRAINT chk_rol CHECK (
        rol IN ('ADMINISTRADOR', 'ANALISTA', 'OPERADOR', 'AUDITOR')
    )
);

CREATE TABLE trida.dispositivos (
    id_dispositivo      SERIAL PRIMARY KEY,
    id_cliente          INTEGER NOT NULL
                            REFERENCES trida.clientes (id_cliente)
                            ON UPDATE CASCADE
                            ON DELETE RESTRICT,
    tipo_dispositivo    VARCHAR(50) NOT NULL,
    identificador_unico VARCHAR(255) NOT NULL UNIQUE,
    sistema_operativo   VARCHAR(100) NOT NULL,
    navegador           VARCHAR(100) NOT NULL,
    fecha_primer_uso    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_ultimo_uso    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_fechas_dispositivo CHECK (
        fecha_ultimo_uso >= fecha_primer_uso
    )
);

CREATE TABLE trida.historico_de_ubicacion (
    id_ubicacion        SERIAL PRIMARY KEY,
    id_dispositivo      INTEGER NOT NULL
                            REFERENCES trida.dispositivos (id_dispositivo)
                            ON UPDATE CASCADE
                            ON DELETE RESTRICT,
    direccion_ip        INET NOT NULL,
    pais                VARCHAR(100) NOT NULL,
    ciudad              VARCHAR(100) NOT NULL,
    latitud             NUMERIC(9, 6),
    longitud            NUMERIC(9, 6),
    fecha_registro      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_latitud CHECK (
        latitud BETWEEN -90 AND 90
    ),
    CONSTRAINT chk_longitud CHECK (
        longitud BETWEEN -180 AND 180
    )
);

CREATE TABLE trida.transacciones (
    id_transaccion          SERIAL PRIMARY KEY,
    id_cliente              INTEGER NOT NULL
                                REFERENCES trida.clientes (id_cliente)
                                ON UPDATE CASCADE
                                ON DELETE RESTRICT,
    id_dispositivo          INTEGER NOT NULL
                                REFERENCES trida.dispositivos (id_dispositivo)
                                ON UPDATE CASCADE
                                ON DELETE RESTRICT,
    id_ubicacion            INTEGER NOT NULL
                                REFERENCES trida.historico_de_ubicacion (id_ubicacion)
                                ON UPDATE CASCADE
                                ON DELETE RESTRICT,
    id_banco                INTEGER NOT NULL DEFAULT 1
                                REFERENCES trida.bancos (id_banco)
                                ON UPDATE CASCADE
                                ON DELETE RESTRICT,
    tipo_transaccion        VARCHAR(50) NOT NULL,
    monto                   NUMERIC(15, 2) NOT NULL,
    cuenta_origen           VARCHAR(30) NOT NULL,
    cuenta_destino          VARCHAR(30) NOT NULL,
    fecha_transaccion       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    score_riesgo            NUMERIC(5, 1),
    estado_transaccion      VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    es_fraude_real          BOOLEAN,
    tiempo_de_procesamiento INTEGER NOT NULL DEFAULT 0,
    moneda                  CHAR(3) NOT NULL DEFAULT 'COP',
    canal                   VARCHAR(20) NOT NULL DEFAULT 'web',
    CONSTRAINT chk_monto_positivo CHECK (
        monto > 0
    ),
    CONSTRAINT chk_score_riesgo CHECK (
        score_riesgo BETWEEN 0 AND 100
    ),
    CONSTRAINT chk_estado_transaccion CHECK (
        estado_transaccion IN ('PENDIENTE', 'APROBADA', 'ALERTADA', 'BLOQUEADA')
    ),
    CONSTRAINT chk_tiempo_procesamiento CHECK (
        tiempo_de_procesamiento >= 0
    ),
    CONSTRAINT chk_moneda CHECK (
        moneda ~ '^[A-Z]{3}$'
    ),
    CONSTRAINT chk_canal_transaccion CHECK (
        canal IN ('mobile', 'web', 'pos', 'atm', 'branch')
    )
);

CREATE TABLE trida.alertas (
    id_alerta               SERIAL PRIMARY KEY,
    id_transaccion          INTEGER NOT NULL
                                REFERENCES trida.transacciones (id_transaccion)
                                ON UPDATE CASCADE
                                ON DELETE RESTRICT,
    nivel_criticidad        VARCHAR(10) NOT NULL,
    fecha_generacion        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    factores_sospechosos    TEXT,
    estado_alerta           VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
    prioridad               SMALLINT NOT NULL DEFAULT 1,
    CONSTRAINT chk_nivel_criticidad CHECK (
        nivel_criticidad IN ('BAJA', 'MEDIA', 'ALTA', 'CRITICA')
    ),
    CONSTRAINT chk_estado_alerta CHECK (
        estado_alerta IN ('ACTIVA', 'EN_REVISION', 'RESUELTA', 'DESCARTADA')
    ),
    CONSTRAINT chk_prioridad CHECK (
        prioridad BETWEEN 1 AND 10
    )
);

CREATE TABLE trida.validaciones (
    id_validacion       SERIAL PRIMARY KEY,
    id_alerta           INTEGER NOT NULL
                            REFERENCES trida.alertas (id_alerta)
                            ON UPDATE CASCADE
                            ON DELETE RESTRICT,
    id_usuario          INTEGER NOT NULL
                            REFERENCES trida.usuarios_sistemas (id_usuario)
                            ON UPDATE CASCADE
                            ON DELETE RESTRICT,
    clasificacion       VARCHAR(35) NOT NULL,
    comentarios         TEXT,
    fecha_validacion    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accion_tomada       VARCHAR(50),
    CONSTRAINT chk_clasificacion CHECK (
        clasificacion IN (
            'FRAUDE_CONFIRMADO',
            'FALSO_POSITIVO',
            'PENDIENTE_INVESTIGACION',
            'REQUIERE_CONTACTO_CLIENTE'
        )
    )
);

CREATE TABLE trida.reportes (
    id_reporte                  SERIAL PRIMARY KEY,
    id_usuario_generador        INTEGER NOT NULL
                                    REFERENCES trida.usuarios_sistemas (id_usuario)
                                    ON UPDATE CASCADE
                                    ON DELETE RESTRICT,
    tipo_reporte                VARCHAR(30) NOT NULL,
    fecha_inicio                TIMESTAMPTZ NOT NULL,
    fecha_fin                   TIMESTAMPTZ NOT NULL,
    total_transacciones         INTEGER,
    total_alertas_generadas     INTEGER,
    fraudes_detectados          INTEGER,
    falsos_positivos            INTEGER,
    tasa_deteccion              NUMERIC(5, 2),
    tiempo_promedio_respuesta   NUMERIC(8, 2),
    monto_protegido             NUMERIC(20, 2),
    fecha_generacion            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ruta_archivo                TEXT NOT NULL,
    CONSTRAINT chk_fechas_reporte CHECK (
        fecha_fin >= fecha_inicio
    ),
    CONSTRAINT chk_tipo_reporte CHECK (
        tipo_reporte IN ('DIARIO', 'SEMANAL', 'MENSUAL', 'PERSONALIZADO')
    ),
    CONSTRAINT chk_tasa_deteccion CHECK (
        tasa_deteccion BETWEEN 0 AND 100
    ),
    CONSTRAINT chk_monto_protegido CHECK (
        monto_protegido >= 0
    )
);

CREATE TABLE trida.logs_auditoria (
    id_log              SERIAL PRIMARY KEY,
    id_usuario          INTEGER NOT NULL
                            REFERENCES trida.usuarios_sistemas (id_usuario)
                            ON UPDATE CASCADE
                            ON DELETE RESTRICT,
    tipo_accion         VARCHAR(50) NOT NULL,
    entidad_afectada    VARCHAR(50) NOT NULL,
    descripcion         TEXT,
    fecha_accion        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    id_identidad        INTEGER NOT NULL,
    direccion_ip        INET NOT NULL
);

CREATE RULE logs_no_update AS
    ON UPDATE TO trida.logs_auditoria DO INSTEAD NOTHING;

CREATE RULE logs_no_delete AS
    ON DELETE TO trida.logs_auditoria DO INSTEAD NOTHING;

CREATE INDEX idx_bancos_codigo
    ON trida.bancos (codigo);

CREATE INDEX idx_clientes_id_banco
    ON trida.clientes (id_banco);

CREATE INDEX idx_clientes_estado
    ON trida.clientes (estado);

CREATE INDEX idx_clientes_ciudad
    ON trida.clientes (ciudad);

CREATE INDEX idx_usuarios_rol
    ON trida.usuarios_sistemas (rol);

CREATE INDEX idx_usuarios_estado
    ON trida.usuarios_sistemas (estado);

CREATE INDEX idx_dispositivos_id_cliente
    ON trida.dispositivos (id_cliente);

CREATE INDEX idx_ubicacion_id_dispositivo
    ON trida.historico_de_ubicacion (id_dispositivo);

CREATE INDEX idx_ubicacion_ciudad
    ON trida.historico_de_ubicacion (ciudad);

CREATE INDEX idx_transacciones_id_cliente
    ON trida.transacciones (id_cliente);

CREATE INDEX idx_transacciones_id_banco
    ON trida.transacciones (id_banco);

CREATE INDEX idx_transacciones_score_riesgo
    ON trida.transacciones (score_riesgo DESC)
    WHERE score_riesgo IS NOT NULL;

CREATE INDEX idx_transacciones_fecha
    ON trida.transacciones (fecha_transaccion DESC);

CREATE INDEX idx_transacciones_estado
    ON trida.transacciones (estado_transaccion);

CREATE INDEX idx_transacciones_canal
    ON trida.transacciones (canal);

CREATE INDEX idx_alertas_nivel_criticidad
    ON trida.alertas (nivel_criticidad);

CREATE INDEX idx_alertas_estado
    ON trida.alertas (estado_alerta);

CREATE INDEX idx_alertas_fecha
    ON trida.alertas (fecha_generacion DESC);

CREATE INDEX idx_alertas_nivel_estado
    ON trida.alertas (nivel_criticidad, estado_alerta);

CREATE INDEX idx_validaciones_clasificacion
    ON trida.validaciones (clasificacion);

CREATE INDEX idx_validaciones_id_alerta
    ON trida.validaciones (id_alerta);

CREATE INDEX idx_logs_id_usuario
    ON trida.logs_auditoria (id_usuario);

CREATE INDEX idx_logs_fecha_accion
    ON trida.logs_auditoria (fecha_accion DESC);

CREATE INDEX idx_logs_tipo_accion
    ON trida.logs_auditoria (tipo_accion);