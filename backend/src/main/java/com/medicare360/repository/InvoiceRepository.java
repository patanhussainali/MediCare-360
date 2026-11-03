package com.medicare360.repository;

import com.medicare360.entity.Invoice;
import com.medicare360.entity.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long>, JpaSpecificationExecutor<Invoice> {

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    Page<Invoice> findByPatient_Id(Long patientId, Pageable pageable);

    Page<Invoice> findByPaymentStatus(PaymentStatus paymentStatus, Pageable pageable);
}
