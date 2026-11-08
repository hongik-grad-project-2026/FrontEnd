import BaseModal from "./BaseModal";
import { InputIconButton } from "../common/IconButton";
import styles from "./UsageGuideModal.module.css";
import Button from "../common/Button";

function ContentSection({ title = "", text = "", link, footer }) {
    return (
        <section className={styles.contentSection}>
            {title === "" ? null : (
                <p className={styles.contentSectionTitle}>
                    {title}
                </p>
            )}

            {text === "" ? null : (
                <div className={styles.contentSectionText}>
                    <p>{text}</p>
                    {link ? (
                        <a href={link.href} target="_blank" rel="noopener noreferrer">
                            {link.label}
                        </a>
                    ) : null}
                    {footer ? <p>{footer}</p> : null}
                </div>
            )}
        </section>
    );
}

function UsageGuideModal({ isOpen, title, content = [], onClose, id, onClick }) {

    return (
        <BaseModal
            isOpen={isOpen}
            //  ariaDescribedBy,
            //   ariaLabel,
            //   ariaLabelledBy,
            children
            className={styles.base}
            closeOnEscape={true}
            closeOnOverlay={true}
            //   initialFocusRef,
            onClose={onClose}
        //   returnFocusRef,
        >
            <section className={styles.modalContent}>
                <header className={styles.header}>
                    {title}
                    <InputIconButton
                        // ref={closeButtonRef}
                        className={styles.closeButton}
                        icon="close"
                        type="button"
                        ariaLabel="대여내역 상세 닫기"
                        onClick={() => onClose?.()}
                    // disabled={isPending}
                    />

                </header>
                <div className={styles.body} >
                    {content.map((section) => (
                        <ContentSection key={section.id} title={section.title} text={section.content} link={section.link} footer={section.footer} />
                    ))}

                    {(id === 'withdrawal') && (
                        <div className={styles.withdrawalButtonContainer}>
                            <Button
                                color="Danger"
                                kind="border"
                                size="small"
                                status="Default"
                                text="회원 탈퇴"
                                type="button"
                                onClick={onClick}
                            />
                        </div>
                    )}

                </div>
            </section>


        </BaseModal>

    );
}

export default UsageGuideModal;
