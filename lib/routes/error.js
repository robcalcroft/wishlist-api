module.exports = function(app) {

    app.all("*", function(req, res) {
        $utils.response(res, {
            status: 404
        });
    });

};
