use utils::*;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(move || {
        App::new()
            .wrap(middleware::Logger::default())
            .service(web::resource("/").to(|| async { "Hello world!" }))
            .service(web::resource("/random").to(|| async { get_random_number() }))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
