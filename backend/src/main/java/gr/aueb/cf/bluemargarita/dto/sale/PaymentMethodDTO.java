package gr.aueb.cf.bluemargarita.dto.sale;

import gr.aueb.cf.bluemargarita.core.enums.PaymentMethod;

public record PaymentMethodDTO(
   PaymentMethod value,
   String displayName
) {}
