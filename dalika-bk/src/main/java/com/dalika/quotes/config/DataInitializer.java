package com.dalika.quotes.config;

import com.dalika.quotes.brand.entity.Brand;
import com.dalika.quotes.brand.repository.BrandRepository;
import com.dalika.quotes.category.entity.Category;
import com.dalika.quotes.category.repository.CategoryRepository;
import com.dalika.quotes.quote.entity.QuoteItem;
import com.dalika.quotes.quote.entity.QuoteRequest;
import com.dalika.quotes.quote.entity.QuoteResponse;
import com.dalika.quotes.quote.entity.QuoteStatus;
import com.dalika.quotes.quote.repository.QuoteRequestRepository;
import com.dalika.quotes.user.entity.Role;
import com.dalika.quotes.user.entity.User;
import com.dalika.quotes.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.List;
import java.util.Set;

@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    @Profile({"dev", "prod"})
    public CommandLineRunner initData(
            UserRepository userRepository,
            BrandRepository brandRepository,
            CategoryRepository categoryRepository,
            QuoteRequestRepository quoteRequestRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            if (userRepository.count() > 0) {
                return;
            }

            User admin = User.builder()
                    .name("Admin User")
                    .email("admin@dalika.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);

            User rep = User.builder()
                    .name("Sales Rep")
                    .email("rep@dalika.com")
                    .password(passwordEncoder.encode("rep123"))
                    .role(Role.REP)
                    .build();
            userRepository.save(rep);

            User client1 = User.builder()
                    .name("Maria Garcia")
                    .email("client@example.com")
                    .password(passwordEncoder.encode("client123"))
                    .role(Role.CLIENT)
                    .build();
            userRepository.save(client1);

            User client2 = User.builder()
                    .name("Carlos Lopez")
                    .email("client2@example.com")
                    .password(passwordEncoder.encode("client123"))
                    .role(Role.CLIENT)
                    .build();
            userRepository.save(client2);

            Category electronics = Category.builder()
                    .name("Electronica")
                    .description("Productos electronicos y tecnologicos")
                    .build();
            categoryRepository.save(electronics);

            Category home = Category.builder()
                    .name("Hogar")
                    .description("Articulos para el hogar y decoracion")
                    .build();
            categoryRepository.save(home);

            Category industrial = Category.builder()
                    .name("Industrial")
                    .description("Equipos y herramientas industriales")
                    .build();
            categoryRepository.save(industrial);

            Category office = Category.builder()
                    .name("Oficina")
                    .description("Mobiliario y suministros de oficina")
                    .build();
            categoryRepository.save(office);

            Category sports = Category.builder()
                    .name("Deportes")
                    .description("Equipamiento deportivo y fitness")
                    .build();
            categoryRepository.save(sports);

            Brand samsung = Brand.builder()
                    .name("Samsung")
                    .description("Lider en tecnologia y electronica de consumo")
                    .logoUrl("https://placehold.co/120x60/1e293b/ffffff?text=Samsung")
                    .externalLink("https://www.samsung.com")
                    .categories(Set.of(electronics))
                    .build();
            brandRepository.save(samsung);

            Brand lg = Brand.builder()
                    .name("LG")
                    .description("Innovacion en electrodomesticos y pantallas")
                    .logoUrl("https://placehold.co/120x60/7c3aed/ffffff?text=LG")
                    .externalLink("https://www.lg.com")
                    .categories(Set.of(electronics))
                    .build();
            brandRepository.save(lg);

            Brand bosch = Brand.builder()
                    .name("Bosch")
                    .description("Herramientas y electrodomesticos de alta calidad")
                    .logoUrl("https://placehold.co/120x60/e11d48/ffffff?text=Bosch")
                    .externalLink("https://www.bosch.com")
                    .categories(Set.of(industrial))
                    .build();
            brandRepository.save(bosch);

            Brand ikea = Brand.builder()
                    .name("IKEA")
                    .description("Muebles y decoracion para el hogar")
                    .logoUrl("https://placehold.co/120x60/2563eb/ffffff?text=IKEA")
                    .externalLink("https://www.ikea.com")
                    .categories(Set.of(home))
                    .build();
            brandRepository.save(ikea);

            Brand hermanMiller = Brand.builder()
                    .name("Herman Miller")
                    .description("Mobiliario de oficina ergonomico premium")
                    .logoUrl("https://placehold.co/120x60/059669/ffffff?text=Herman+Miller")
                    .externalLink("https://www.hermanmiller.com")
                    .categories(Set.of(office))
                    .build();
            brandRepository.save(hermanMiller);

            Brand apple = Brand.builder()
                    .name("Apple")
                    .description("Dispositivos y ecosistema tecnologico")
                    .logoUrl("https://placehold.co/120x60/333333/ffffff?text=Apple")
                    .externalLink("https://www.apple.com")
                    .categories(Set.of(electronics))
                    .build();
            brandRepository.save(apple);

            QuoteRequest qr1 = QuoteRequest.builder()
                    .title("Equipamiento de oficina nuevo")
                    .description("Necesito cotizacion para equipar una oficina de 20 personas con computadoras, monitores y sillas ergonomicas.")
                    .status(QuoteStatus.QUOTED)
                    .client(client1)
                    .respondedAt(Instant.now().minusSeconds(2 * 86400))
                    .expiresAt(Instant.now().plusSeconds(28 * 86400))
                    .build();

            QuoteItem item1 = QuoteItem.builder()
                    .productUrl("https://www.apple.com/macbook-pro")
                    .productName("MacBook Pro 14")
                    .quantity(20)
                    .quoteRequest(qr1)
                    .build();

            QuoteItem item2 = QuoteItem.builder()
                    .productUrl("https://www.hermanmiller.com/aeron")
                    .productName("Silla Aeron")
                    .quantity(20)
                    .quoteRequest(qr1)
                    .build();

            QuoteItem item3 = QuoteItem.builder()
                    .productUrl("https://www.samsung.com/monitors")
                    .productName("Monitor Samsung 27")
                    .quantity(20)
                    .quoteRequest(qr1)
                    .build();

            qr1.setItems(List.of(item1, item2, item3));

            QuoteResponse response1 = QuoteResponse.builder()
                    .quoteRequest(qr1)
                    .quoteUrl("https://cotizacion.dalika.com/qr-001")
                    .adminNotes("Cotizacion enviada con descuento corporativo del 15%.")
                    .createdAt(Instant.now().minusSeconds(2 * 86400))
                    .build();
            qr1.setResponse(response1);

            quoteRequestRepository.save(qr1);

            QuoteRequest qr2 = QuoteRequest.builder()
                    .title("Herramientas industriales")
                    .description("Requiere cotizacion de herramientas electricas para planta de produccion.")
                    .status(QuoteStatus.PENDING)
                    .client(client1)
                    .build();

            QuoteItem item4 = QuoteItem.builder()
                    .productUrl("https://www.dewalt.com/drills")
                    .productName("Taladro DeWalt 20V")
                    .quantity(5)
                    .quoteRequest(qr2)
                    .build();

            QuoteItem item5 = QuoteItem.builder()
                    .productUrl("https://www.bosch.com/grinders")
                    .productName("Amoladora Bosch")
                    .quantity(3)
                    .quoteRequest(qr2)
                    .build();

            qr2.setItems(List.of(item4, item5));

            quoteRequestRepository.save(qr2);

            QuoteRequest qr3 = QuoteRequest.builder()
                    .title("Equipamiento deportivo gimnasio")
                    .description("Cotizacion para equipar un gimnasio pequeno con equipos de cardio y peso.")
                    .status(QuoteStatus.PENDING)
                    .client(client2)
                    .build();

            QuoteItem item6 = QuoteItem.builder()
                    .productUrl("https://www.nike.com/training")
                    .productName("Equipos Nike Training")
                    .quoteRequest(qr3)
                    .build();

            qr3.setItems(List.of(item6));

            quoteRequestRepository.save(qr3);

            log.info("Development data initialized successfully!");
            log.info("Admin: admin@dalika.com / admin123");
            log.info("Rep: rep@dalika.com / rep123");
            log.info("Client: client@example.com / client123");
        };
    }
}
