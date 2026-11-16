-- URBAN STYLE - estrutura do banco de dados
CREATE DATABASE IF NOT EXISTS urban_style
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE urban_style;

CREATE TABLE IF NOT EXISTS clientes (
  id       INT          NOT NULL AUTO_INCREMENT,
  nome     VARCHAR(100) NOT NULL,
  email    VARCHAR(150) NOT NULL,
  telefone VARCHAR(20)  NOT NULL,
  endereco VARCHAR(200) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT uq_clientes_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
