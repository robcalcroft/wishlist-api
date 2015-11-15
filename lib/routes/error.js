
import { response } from "controllers/utils";

Wishlist.app.all("*", function(req, res) {
    response(res, {
        status: 404
    });
});
