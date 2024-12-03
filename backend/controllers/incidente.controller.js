const db = require('../models');
const path = require('path');
const fs = require('fs');


exports.listIncidentes = async (req, res) => {
    try {
        const incidentes = await db.incidente.findAll({
            order: [['fecha', 'DESC']],
            include: [
                {
                    model: db.carretera,
                    as: 'carretera',
                    attributes: ['nombre']
                },
                {
                    model: db.municipio,
                    as: 'municipio',
                    attributes: ['nombre']
                },
                {
                    model: db.usuario,
                    as: 'usuario',
                    attributes: ['nombre']
                }
            ]
        });
        res.status(200).json(incidentes);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

exports.getIncidenteById = async (req, res) => {
    const id = req.params.id;
    try {
        const incidente = await db.incidentes.findByPk(id, {
            include: [
                {
                    model: db.carretera,
                    as: 'carretera',
                    attributes: ['nombre']
                },
                {
                    model: db.usuario,
                    as: 'usuario',
                },
                {
                    model: db.tipoIncidente,
                    as: 'tipoIncidente',
                    attributes: ['nombre']
                }
            ]
        });
        res.status(200).json(incidente);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

exports.getCarreteraByIncidenteId = async (req, res) => {
    const incidenteId = req.params.id;

    try {
        // Buscar el incidente para obtener la carretera asociada
        const incidente = await db.incidentes.findByPk(incidenteId, {
            include: [
                {
                    model: db.carretera,
                    as: 'carretera',
                    attributes: ['nombre'],
                    include: [
                        {
                            model: db.municipio,
                            as: 'municipioOrigen',
                            attributes: ['nombre'],
                        },
                        {
                            model: db.municipio,
                            as: 'municipioDestino',
                            attributes: ['nombre'],
                        },
                    ],
                },
                {
                    model: db.tipoIncidente,
                    as: 'tipoIncidente',
                    attributes: ['nombre'],
                },
            ],
        });

        if (incidente) {
            res.status(200).json(incidente);
        } else {
            res.status(404).json({
                message: 'Incidente no encontrado o no asociado a una carretera',
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener la carretera asociada al incidente',
            error: error.message,
        });
    }
};


exports.createIncidente = async (req, res) => {
    const image = req.files.photo;
    try{
        const incidente = {
            estaConfirmada: req.body.estaConfirmada,
            latitud: req.body.latitud,
            longitud: req.body.longitud,
            tipoId: req.body.tipoId,
            ultimoCambioId: req.body.ultimoCambioId,
        }
        const incidenteCreado = await db.incidentes.create(incidente);
        const path =  __dirname + '/../public/images/incidentes/' + incidenteCreado.id + '.jpg';
        image.mv(path, (error) => {
            if (error) {
                console.error(error);
                res.status(500).json({
                    message: error.message
                });
            }
        });
        res.status(201).json(incidenteCreado);
    }
    catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}
exports.updateIncidente = async (req, res) => {
    const id = req.params.id;
    const photo = req.files ? req.files.photo : null;
    try{
        const incidente = await db.incidentes.findByPk(id);
        if (!tipo){
            return;
        }

        incidente.estaConfirmada = req.body.estaConfirmada;
        incidente.latitud = req.body.latitud;
        incidente.longitud = req.body.longitud;
        incidente.tipoId = req.body.tipoId;
        incidente.ultimoCambioId = req.body.ultimoCambioId;
        if (photo) {
            const path =  __dirname + '/../public/images/incidentes/' + incidente.id + '.jpg';
            photo.mv(path, function(err){
                if (err) {
                    return res.status(500).json({error: err});
                }
            });
        }
        await incidente.save();
        res.status(200).json(incidente);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

exports.getImagenIncidente = async (req, res) => {
    const id = req.params.id;
    const imagePath =  path.join(__dirname + '/../public/images/incidentes/' + id + '.jpg');

    fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) {
            res.status(404).json({
                message: 'Imagen no encontrada',
            });
        }
        res.sendFile(imagePath);
    });
}
exports.deleteIncidente = async (req, res) => {
    const id = req.params.id;
    try{
        const incidente = await db.incidentes.findByPk(id);
        if (!incidente){
            res.status(404).json({
                message: 'Incidente no encontrado'
            });
        }
        await incidente.destroy();
        res.status(200).json();
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}