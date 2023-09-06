const express = require('express')
const https = require('https');
const config = require('config');
const bodyParser = require('body-parser');
const { default: axios } = require('axios');

const app = express()
const port = 3000



app.use(bodyParser.json());


// app.get('/', (req, res) => {
//     console.log(req)
//     res.send("Ok");
// })

app.get('/search', (req, res) => {
    let email = req.body.email;
    let phone = req.body.phone;

    https.get(config.url + "/api/v4/contacts", {
        headers: {
            Authorization: 'Bearer ' + config.bearer
        }
    }, (response) => {

        response.on('data', (data) => {
            let users = JSON.parse(data)._embedded.contacts;
            let email = req.body.email;
            let phone = req.body.phone;
            if (users.find((item) => item.custom_fields_values[1].values[0].value == email)) {
                updateData(req, res, 'email', email, phone, users)

            } else {

                if (users.find((item) => item.custom_fields_values[0].values[0].value == phone)) {
                    updateData(req, res, 'email', email, phone, users)
                } else {

                    axios.request({
                        data: [
                            {
                                first_name: req.body.first_name,
                                last_name: req.body.last_name
                            }
                        ],
                        headers: {
                            Authorization: `Bearer ${config.bearer}`
                        },
                        method: "POST",
                        url: config.url + '/api/v4/contacts'
                    }).then(response => {
                        res.send('Пользователь создан')
                    });



                }

            }

        });

    }).on('error', (err) => {
        console.error(err);
    });

})

function updateData(req, res, type, email, phone, users) {
    if (type == "email") {
        axios.request({
            data: {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
            },
            headers: {
                Authorization: `Bearer ${config.bearer}`
            },
            method: "PATCH",
            url: config.url + "/api/v4/contacts/" + users.find((item) => item.custom_fields_values[1].values[0].value == email).id
        }).then(response => {
            res.send('Данные изменены')
        });
    } else {
        axios.request({
            data: {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
            },
            headers: {
                Authorization: `Bearer ${config.bearer}`
            },
            method: "PATCH",
            url: config.url + "/api/v4/contacts/" + users.find((item) => item.custom_fields_values[0].values[0].value == phone).id
        }).then(response => {
            res.send('Данные изменены')
        });
    }

}

app.listen(port, () => {


    console.log(`Example app listening on port ${port}`)
})

