package com.medicare360.repository;

import com.medicare360.entity.Invoice;
import com.medicare360.entity.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvoiceRepository extends MongoRepository<Invoice, String> {

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    Page<Invoice> findByPatientId(String patientId, Pageable pageable);

    Page<Invoice> findByPaymentStatus(PaymentStatus paymentStatus, Pageable pageable);
}
