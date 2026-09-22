import { useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import IconButton from "../../components/common/IconButton";
import Pagination from "../../components/common/Pagination";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import Tabs from "../../components/common/Tabs";
import PageHeader from "../../components/layout/PageHeader";
import ConfirmModal from "../../components/modal/ConfirmModal";
import EquipmentCreateModal from "../../components/modal/EquipmentCreateModal";
import EquipmentDisposeModal from "../../components/modal/EquipmentDisposeModal";
import EquipmentItemEditModal from "../../components/modal/EquipmentItemEditModal";
import DataTable from "../../components/table/DataTable";
import styles from "./AdminEquipmentListPage.module.css";

const ROWS_PER_PAGE = 10;

const EQUIPMENT_CATEGORIES = [
  { value: "laptop", label: "노트북" },
  { value: "tablet", label: "태블릿" },
  { value: "keyboard-mouse", label: "키보드/마우스" },
  { value: "power-bank", label: "보조배터리" },
  { value: "laptop-stand", label: "노트북 거치대" },
  { value: "book-stand", label: "독서대" },
];

const CATEGORY_LABELS = Object.fromEntries(
  EQUIPMENT_CATEGORIES.map((category) => [category.value, category.label]),
);

const STATUS_BADGES = {
  active: "기자재-대여진행",
  paused: "기자재-대여중지",
};

// 화면과 목록 동작 확인용 임시 데이터
// 실제 기자재, 제품 사양, API 응답 또는 서버 상태값을 의미하지 않음
const MOCK_EQUIPMENT = [
  {
    id: "mock-equipment-001",
    name: "화면 확인용 노트북 A",
    modelName: "MOCK-LAPTOP-A",
    category: "laptop",
    os: "Windows",
    accessories: "본체, 파우치, 충전 케이블",
    specification: "화면 확인용 성능 정보",
    description: "일반적인 두 줄 설명의 배치를 확인합니다.",
    stockText: "3 / 5",
    status: "active",
    receivedDate: "2026.08.01",
    disposalDate: "2028.08.01",
  },
  {
    id: "mock-equipment-002",
    name: "화면 확인용 긴 기자재명과 말줄임을 확인하는 노트북 B",
    modelName: "MOCK-LAPTOP-B-LONG-MODEL-NAME",
    category: "laptop",
    os: "macOS",
    accessories: "본체, 보호 케이스, 파우치, 어댑터, 충전 케이블",
    specification: "긴 성능 정보가 두 줄을 초과할 때 표시를 확인합니다.",
    description:
      "긴 설명이 셀 너비와 행 높이를 넘지 않도록 두 줄 말줄임을 확인하는 임시 내용입니다.",
    stockText: "0 / 4",
    status: "paused",
    receivedDate: "2026.08.02",
    disposalDate: "2028.08.02",
  },
  {
    id: "mock-equipment-003",
    name: "화면 확인용 태블릿 A",
    modelName: "MOCK-TABLET-A",
    category: "tablet",
    os: "Android",
    accessories: "본체, 케이스, 충전 케이블",
    specification: "화면 확인용 성능 정보",
    description: "카테고리와 OS의 두 줄 표시를 확인합니다.",
    stockText: "2 / 3",
    status: "active",
    receivedDate: "2026.08.03",
    disposalDate: "2028.08.03",
  },
  {
    id: "mock-equipment-004",
    name: "화면 확인용 태블릿 B",
    modelName: "MOCK-TABLET-B",
    category: "tablet",
    os: "iPadOS",
    accessories: "본체, 케이스",
    specification: "",
    description: "성능 정보가 없는 셀의 배치를 확인합니다.",
    stockText: "0 / 2",
    status: "paused",
    receivedDate: "2026.08.04",
    disposalDate: "2028.08.04",
  },
  {
    id: "mock-equipment-005",
    name: "화면 확인용 키보드/마우스 A",
    modelName: "",
    category: "keyboard-mouse",
    os: "",
    accessories: "키보드, 마우스",
    specification: "",
    description: "모델명과 OS가 없는 한 줄 표시를 확인합니다.",
    stockText: "4 / 6",
    status: "active",
    receivedDate: "2026.08.05",
    disposalDate: "2028.08.05",
  },
  {
    id: "mock-equipment-006",
    name: "화면 확인용 키보드/마우스 B",
    modelName: "MOCK-INPUT-B",
    category: "keyboard-mouse",
    os: "",
    accessories: "키보드, 마우스, 수신기",
    specification: "화면 확인용 연결 정보",
    description: "대여중지 배지의 표시를 확인합니다.",
    stockText: "0 / 3",
    status: "paused",
    receivedDate: "2026.08.06",
    disposalDate: "2028.08.06",
  },
  {
    id: "mock-equipment-007",
    name: "화면 확인용 보조배터리 A",
    modelName: "MOCK-BATTERY-A",
    category: "power-bank",
    os: "",
    accessories: "본체, 충전 케이블",
    specification: "화면 확인용 용량 정보",
    description: "OS 없이 카테고리만 표시합니다.",
    stockText: "5 / 8",
    status: "active",
    receivedDate: "2026.08.07",
    disposalDate: "2028.08.07",
  },
  {
    id: "mock-equipment-008",
    name: "화면 확인용 보조배터리 B",
    modelName: "MOCK-BATTERY-B",
    category: "power-bank",
    os: "",
    accessories: "본체, 파우치, 충전 케이블",
    specification: "화면 확인용 용량 정보",
    description: "",
    stockText: "0 / 4",
    status: "paused",
    receivedDate: "2026.08.08",
    disposalDate: "2028.08.08",
  },
  {
    id: "mock-equipment-009",
    name: "화면 확인용 노트북 거치대 A",
    modelName: "MOCK-LAPTOP-STAND-A",
    category: "laptop-stand",
    os: "",
    accessories: "거치대, 보관 파우치",
    specification: "",
    description: "거치대 카테고리의 목록을 확인합니다.",
    stockText: "2 / 2",
    status: "active",
    receivedDate: "2026.08.09",
    disposalDate: "2028.08.09",
  },
  {
    id: "mock-equipment-010",
    name: "화면 확인용 노트북 거치대 B",
    modelName: "MOCK-LAPTOP-STAND-B",
    category: "laptop-stand",
    os: "",
    accessories: "거치대",
    specification: "",
    description: "첫 페이지의 마지막 행을 확인합니다.",
    stockText: "0 / 2",
    status: "paused",
    receivedDate: "2026.08.10",
    disposalDate: "2028.08.10",
  },
  {
    id: "mock-equipment-011",
    name: "화면 확인용 독서대 A",
    modelName: "MOCK-BOOK-STAND-A",
    category: "book-stand",
    os: "",
    accessories: "독서대",
    specification: "",
    description: "두 번째 페이지의 목록을 확인합니다.",
    stockText: "1 / 2",
    status: "active",
    receivedDate: "2026.08.11",
    disposalDate: "2028.08.11",
  },
  {
    id: "mock-equipment-012",
    name: "화면 확인용 독서대 B",
    modelName: "MOCK-BOOK-STAND-B",
    category: "book-stand",
    os: "",
    accessories: "독서대, 보관 가방",
    specification: "",
    description: "마지막 페이지와 대여중지 상태를 확인합니다.",
    stockText: "0 / 1",
    status: "paused",
    receivedDate: "2026.08.12",
    disposalDate: "2028.08.12",
  },
];

function canDisposeEquipment(equipment) {
  const matchedStock = equipment.stockText.match(/^\s*(\d+)\s*\/\s*(\d+)\s*$/);

  if (!matchedStock) {
    return false;
  }

  const availableCount = Number(matchedStock[1]);
  const totalCount = Number(matchedStock[2]);

  return availableCount === totalCount;
}

function EquipmentImageCell() {
  return (
    <span className={styles.imageCell} aria-hidden="true">
      <span className={styles.imagePlaceholder}>
        <span className={styles.photoIcon} />
      </span>
    </span>
  );
}

function EquipmentNameCell({ equipment }) {
  return (
    <span className={styles.cellStack}>
      <strong className={styles.equipmentName} title={equipment.name}>
        {equipment.name}
      </strong>

      {equipment.modelName ? (
        <span className={styles.secondaryText} title={equipment.modelName}>
          {equipment.modelName}
        </span>
      ) : null}
    </span>
  );
}

function CategoryCell({ equipment }) {
  return (
    <span className={styles.cellStack}>
      <span className={styles.singleLineText}>
        {CATEGORY_LABELS[equipment.category]}
      </span>

      {equipment.os ? (
        <span className={styles.secondaryText} title={equipment.os}>
          {equipment.os}
        </span>
      ) : null}
    </span>
  );
}

function MultilineCell({ text }) {
  return (
    <span className={styles.multilineText} title={text || undefined}>
      {text}
    </span>
  );
}

function EquipmentDateCell({ equipment }) {
  return (
    <span className={styles.cellStack}>
      <time
        className={styles.dateText}
        dateTime={equipment.receivedDate.replaceAll(".", "-")}
        aria-label={"입고일 " + equipment.receivedDate}
      >
        {equipment.receivedDate}
      </time>

      <time
        className={styles.dateText}
        dateTime={equipment.disposalDate.replaceAll(".", "-")}
        aria-label={"폐기일 " + equipment.disposalDate}
      >
        {equipment.disposalDate}
      </time>
    </span>
  );
}

function EquipmentActionsCell({ equipment, onDispose, onEdit }) {
  const handleEdit = (event) => {
    event.stopPropagation();
    onEdit(equipment, event);
  };

  const handleDispose = (event) => {
    event.stopPropagation();
    onDispose(equipment, event);
  };

  return (
    <span className={styles.actionButtons}>
      <IconButton
        className={styles.actionButton}
        icon="edit"
        size={24}
        type="button"
        ariaLabel={equipment.name + " 수정"}
        onClick={handleEdit}
      />

      <IconButton
        className={styles.actionButton}
        icon="trash"
        size={24}
        type="button"
        ariaLabel={equipment.name + " 폐기"}
        onClick={handleDispose}
      />
    </span>
  );
}

function AdminEquipmentListPage() {
  const navigate = useNavigate();
  const panelId = useId();
  const registerButtonRef = useRef(null);
  const editButtonRef = useRef(null);
  const disposeButtonRef = useRef(null);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editTargetEquipment, setEditTargetEquipment] = useState(null);
  const [disposeTargetEquipment, setDisposeTargetEquipment] = useState(null);
  const [feedbackType, setFeedbackType] = useState(null);

  // 탭의 숫자는 검색 전 전체 목업의 모델 수
  const tabItems = [
    {
      value: "all",
      label: "전체",
      count: MOCK_EQUIPMENT.length,
      controlsId: panelId,
    },
    ...EQUIPMENT_CATEGORIES.map((category) => ({
      ...category,
      count: MOCK_EQUIPMENT.filter(
        (equipment) => equipment.category === category.value,
      ).length,
      controlsId: panelId,
    })),
  ];

  const selectedCategoryLabel =
    selectedCategory === "all" ? "전체" : CATEGORY_LABELS[selectedCategory];

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const filteredEquipment = MOCK_EQUIPMENT.filter((equipment) => {
    const matchesCategory =
      selectedCategory === "all" || equipment.category === selectedCategory;

    const matchesSearch =
      !normalizedSearchTerm ||
      [equipment.name, equipment.modelName].some((value) =>
        value.toLowerCase().includes(normalizedSearchTerm),
      );

    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEquipment.length / ROWS_PER_PAGE),
  );

  const resolvedCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const pageStartIndex = (resolvedCurrentPage - 1) * ROWS_PER_PAGE;

  const visibleEquipment = filteredEquipment.slice(
    pageStartIndex,
    pageStartIndex + ROWS_PER_PAGE,
  );

  const handleCategoryChange = (nextCategory) => {
    setSelectedCategory(nextCategory);
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (inputText) => {
    setSearchTerm(inputText);
    setCurrentPage(1);
  };

  const handleOpenAssetList = (equipment) => {
    navigate(`/admin/equipment/${encodeURIComponent(equipment.id)}/assets`);
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateEquipment = () => {
    // 실제 등록 API와 목록 추가는 아직 연결하지 않음
    setIsCreateModalOpen(false);
    setFeedbackType("create-success");
  };

  const handleOpenEditModal = (equipment, event) => {
    editButtonRef.current = event.currentTarget;
    setEditTargetEquipment(equipment);
  };

  const handleCloseEditModal = () => {
    setEditTargetEquipment(null);
  };

  const handleUpdateEquipment = () => {
    // 실제 수정 API와 목록 변경은 아직 연결하지 않음
    setEditTargetEquipment(null);
    setFeedbackType("edit-success");
  };

  const handleOpenDisposeModal = (equipment, event) => {
    disposeButtonRef.current = event.currentTarget;
    setDisposeTargetEquipment(equipment);
  };

  const handleCloseDisposeModal = () => {
    setDisposeTargetEquipment(null);
  };

  const handleDisposeEquipment = (equipment) => {
    // 실제 폐기 API가 없어서 임시 재고 문자열로 결과만 구분
    const nextFeedbackType = canDisposeEquipment(equipment)
      ? "dispose-success"
      : "dispose-failure";

    setDisposeTargetEquipment(null);
    setFeedbackType(nextFeedbackType);
  };

  const handleCloseFeedback = () => {
    setFeedbackType(null);
  };

  const emptyMessage = normalizedSearchTerm
    ? "검색 조건에 해당하는 기자재가 없습니다."
    : selectedCategory === "all"
      ? "표시할 기자재가 없습니다."
      : "해당 카테고리에 표시할 기자재가 없습니다.";

  const columns = [
    {
      key: "image",
      header: <span className={styles.visuallyHidden}>이미지</span>,
      width: 84,
      render: () => <EquipmentImageCell />,
    },
    {
      key: "name",
      header: "기자재 정보 / 모델명",
      width: 222,
      render: (equipment) => <EquipmentNameCell equipment={equipment} />,
    },
    {
      key: "category",
      header: "카테고리 / OS",
      width: 102,
      render: (equipment) => <CategoryCell equipment={equipment} />,
    },
    {
      key: "accessories",
      header: "구성품",
      width: 136,
      render: (equipment) => <MultilineCell text={equipment.accessories} />,
    },
    {
      key: "specification",
      header: "성능",
      width: 136,
      render: (equipment) => <MultilineCell text={equipment.specification} />,
    },
    {
      key: "description",
      header: "설명",
      width: 136,
      render: (equipment) => <MultilineCell text={equipment.description} />,
    },
    {
      key: "stockText",
      header: "재고",
      width: 60,
      render: (equipment) => (
        <span className={styles.stockText}>{equipment.stockText}</span>
      ),
    },
    {
      key: "status",
      header: "상태",
      width: 92,
      render: (equipment) => (
        <StatusBadge status={STATUS_BADGES[equipment.status]} size="lg" />
      ),
    },
    {
      key: "dates",
      header: "입고 / 폐기일",
      width: 84,
      render: (equipment) => <EquipmentDateCell equipment={equipment} />,
    },
    {
      key: "actions",
      header: "수정/폐기",
      width: 68,
      render: (equipment) => (
        <EquipmentActionsCell
          equipment={equipment}
          onEdit={handleOpenEditModal}
          onDispose={handleOpenDisposeModal}
        />
      ),
    },
  ];

  return (
    <section className={styles.page}>
      <PageHeader />

      <div
        className={styles.contentViewport}
        role="region"
        aria-label="기자재 목록 영역"
        tabIndex={0}
      >
        <div className={styles.content}>
          <div className={styles.toolbar}>
            <Tabs
              className={styles.categoryTabs}
              items={tabItems}
              value={selectedCategory}
              onChange={handleCategoryChange}
              ariaLabel="기자재 카테고리"
            />

            <SearchBar
              className={styles.search}
              name="equipmentSearch"
              width={360}
              value={searchTerm}
              onChange={handleSearchChange}
              onSubmit={handleSearchSubmit}
              ariaLabel="기자재명 또는 모델명 검색"
              placeholder="기자재명 또는 모델명으로 검색..."
            />
          </div>

          <div
            id={panelId}
            className={styles.tablePanel}
            role="tabpanel"
            aria-label={selectedCategoryLabel + " 기자재 목록"}
          >
            <DataTable
              className={styles.dataTable}
              ariaLabel="관리자 기자재 모델 목록"
              columns={columns}
              rows={visibleEquipment}
              getRowId={(equipment) => equipment.id}
              onRowClick={handleOpenAssetList}
              minWidth={1120}
              emptyMessage={emptyMessage}
            />
          </div>

          <div className={styles.footer}>
            <Pagination
              className={styles.pagination}
              page={resolvedCurrentPage}
              totalPages={totalPages}
              onChange={setCurrentPage}
              ariaLabel="기자재 목록 페이지 이동"
            />

            <Button
              ref={registerButtonRef}
              className={styles.registerButton}
              kind="border"
              size="Default"
              color="Primary"
              status="Default"
              showLeftIcon={false}
              type="button"
              text="기자재 등록"
              onClick={handleOpenCreateModal}
            />
          </div>
        </div>
      </div>

      <EquipmentCreateModal
        isOpen={isCreateModalOpen}
        categoryOptions={EQUIPMENT_CATEGORIES}
        onClose={handleCloseCreateModal}
        onConfirm={handleCreateEquipment}
        returnFocusRef={registerButtonRef}
      />

      {editTargetEquipment ? (
        <EquipmentItemEditModal
          key={editTargetEquipment.id}
          isOpen
          equipment={editTargetEquipment}
          categoryOptions={EQUIPMENT_CATEGORIES}
          onClose={handleCloseEditModal}
          onConfirm={handleUpdateEquipment}
          returnFocusRef={editButtonRef}
        />
      ) : null}

      {disposeTargetEquipment ? (
        <EquipmentDisposeModal
          isOpen
          equipment={disposeTargetEquipment}
          categoryLabel={
            CATEGORY_LABELS[disposeTargetEquipment.category] ?? "-"
          }
          onClose={handleCloseDisposeModal}
          onConfirm={handleDisposeEquipment}
          returnFocusRef={disposeButtonRef}
        />
      ) : null}

      <ConfirmModal
        isOpen={feedbackType === "create-success"}
        icon="checkmark"
        title="등록 완료"
        description="정상적으로 등록되었습니다."
        secondaryDescription="기자재 모델 상세페이지에서 기기를 등록해주세요."
        confirmText="확인"
        showCancel={false}
        onClose={handleCloseFeedback}
        onConfirm={handleCloseFeedback}
        returnFocusRef={registerButtonRef}
      />

      <ConfirmModal
        isOpen={feedbackType === "edit-success"}
        icon="checkmark"
        title="수정 완료"
        description="정상적으로 수정되었습니다."
        confirmText="확인"
        showCancel={false}
        onClose={handleCloseFeedback}
        onConfirm={handleCloseFeedback}
        returnFocusRef={editButtonRef}
      />

      <ConfirmModal
        isOpen={feedbackType === "dispose-success"}
        icon="checkmark"
        title="폐기 완료"
        description="정상적으로 폐기처리되었습니다."
        confirmText="확인"
        showCancel={false}
        onClose={handleCloseFeedback}
        onConfirm={handleCloseFeedback}
        returnFocusRef={disposeButtonRef}
      />

      <ConfirmModal
        isOpen={feedbackType === "dispose-failure"}
        icon="warning"
        title="폐기 불가능 상태입니다"
        description="아직 대여중인 기기가 존재합니다."
        confirmText="확인"
        confirmColor="Danger"
        showCancel={false}
        onClose={handleCloseFeedback}
        onConfirm={handleCloseFeedback}
        returnFocusRef={disposeButtonRef}
      />
    </section>
  );
}

export default AdminEquipmentListPage;
