package lk.ijse.config;

import lk.ijse.util.OtpUtil;
import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class WebAppConfig {

    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }

    @Bean
    public OtpUtil otpUtil() {
        return new OtpUtil();
    }

}