package com.projectd.nessfit;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
class NessfitApplicationTests {

	@Test
	void contextLoads() {
	}

}
