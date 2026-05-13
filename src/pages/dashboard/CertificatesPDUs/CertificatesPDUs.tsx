import React, { useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TableSearch from "@/components/reusableComponents/TableSearch";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Download } from "iconoir-react";
import api from "@/lib/axios";
import LoginBanner from "@/assets/certifications.jpg";

type CertificateItem = {
  _id: string;
  status?: string | null;
  certificatePng?: string | null;
  certificatePdf?: string | null;
  moduleType?: string | null;
  completedAt?: string | null;
  issuedAt?: string | null;
  courseId?: {
    _id?: string | null;
    name?: string | null;
    status?: string | null;
  } | null;
};

type CertificatesResponse = {
  data?: CertificateItem[];
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
};

const DEFAULT_LIMIT = 10;

const formatLabel = (value?: string | null, fallback = "") =>
  String(value ?? fallback)
    .replace(/[-_]/g, " ")
    .trim();

const formatDate = (value?: string | null) => {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const CertificatesPDUs: React.FC = () => {
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageLimit, setPageLimit] = useState(DEFAULT_LIMIT);

  useEffect(() => {
    const normalizedQuery = searchInput.trim();
    const debounceTimer = window.setTimeout(() => {
      setDebouncedSearch((prevQuery) =>
        prevQuery === normalizedQuery ? prevQuery : normalizedQuery,
      );
      setCurrentPage((prevPage) => (prevPage === 1 ? prevPage : 1));
    }, 500);

    return () => window.clearTimeout(debounceTimer);
  }, [searchInput]);

  const buildAssetUrl = (path?: string | null) => {
    const value = String(path ?? "").trim();
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value;

    const base = String(import.meta.env.VITE_AWS_S3_PUBLIC_BASE_URL ?? "").trim();
    if (!base) {
      return value;
    }

    const normalizedBase = base.replace(/\/$/, "");
    const normalizedValue = value.replace(/^\//, "");
    return `${normalizedBase}/${normalizedValue}`;
  };

  useEffect(() => {
    let isMounted = true;

    const fetchCertificates = async () => {
      const courseId = localStorage.getItem("selectedCourseId");
      if (!courseId) {
        console.warn(
          "Skipping /user/certificates call: selectedCourseId not found.",
        );
        if (isMounted) {
          setCertificates([]);
          setTotalItems(0);
          setTotalPages(1);
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        const response = await api.get("/user/certificates", {
          params: {
            search: debouncedSearch,
            query: debouncedSearch,
            courseId,
            page: currentPage,
            limit: pageLimit,
          },
        });

        if (isMounted) {
          const payload = (response.data as CertificatesResponse)?.data ?? [];
          const pagination = (response.data as CertificatesResponse)?.pagination;
          setCertificates(Array.isArray(payload) ? payload : []);
          setTotalItems(Number(pagination?.total ?? 0));
          setTotalPages(Math.max(1, Number(pagination?.totalPages ?? 1)));
          setCurrentPage(Math.max(1, Number(pagination?.page ?? currentPage)));
          setPageLimit(Math.max(1, Number(pagination?.limit ?? pageLimit)));
        }
      } catch (error) {
        console.error("Failed to fetch certificates", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchCertificates();

    return () => {
      isMounted = false;
    };
  }, [currentPage, pageLimit, debouncedSearch]);

  const filteredCertificates = useMemo(() => {
    if (selectedCategory === "all") {
      return certificates;
    }

    return certificates.filter(
      (item) => String(item.moduleType ?? "").trim() === selectedCategory,
    );
  }, [certificates, selectedCategory]);

  const mappedCards = useMemo(
    () =>
      filteredCertificates.map((item, index) => {
        const imageUrl = buildAssetUrl(item.certificatePng);
        const pdfUrl = buildAssetUrl(item.certificatePdf);
        const moduleLabel = formatLabel(item.moduleType, "certificate");
        const courseName =
          String(item.courseId?.name ?? "").trim() || "Course Certificate";
        const issuedLabel =
          item.status?.toUpperCase() === "ISSUED"
            ? `Issued on ${formatDate(item.issuedAt)}`
            : `Completed on ${formatDate(item.completedAt)}`;

        return {
          id: item._id || String(index),
          image: imageUrl || LoginBanner,
          title: `${courseName} - ${moduleLabel || "certificate"}`,
          description: issuedLabel,
          badgeText: item.status ?? "-",
          pdfUrl,
        };
      }),
    [filteredCertificates],
  );

  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages, currentPage + 1);

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    if (!pages.includes(1)) {
      pages.unshift(1);
    }

    if (!pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages.filter((page, index, array) => array.indexOf(page) === index);
  }, [currentPage, totalPages]);

  const handleDownload = (pdfUrl: string, title: string) => {
    if (!pdfUrl) {
      return;
    }

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `${title}.pdf`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="justify-start text-2xl font-bold">My Certificates</h2>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        {/* <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="max-w-72 py-[11px]">
            <SelectValue placeholder="Select A Category" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((category) => (
              <SelectItem key={category} value={category}>
                {category === "all"
                  ? "All Categories"
                  : formatLabel(category, "Category")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select> */}
        <div className="flex items-center gap-1 md:gap-3">
          <TableSearch
            value={searchInput}
            onChange={setSearchInput}
            onSubmit={() => {
              const normalizedQuery = searchInput.trim();
              setCurrentPage(1);
              setDebouncedSearch(normalizedQuery);
              setSearchInput(normalizedQuery);
            }}
            placeholder="Search certificates"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-sm text-paragraph">Loading certificates...</div>
      ) : mappedCards.length ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mappedCards.map((course) => {
              return (
                <div
                  key={course.id}
                  className="relative inline-flex flex-col items-start justify-start gap-5 rounded-lg bg-[#DBE8FB] p-3 pb-5"
                >
                  <Button
                    className="absolute top-5 right-5 max-h-[38px] !px-4 transition-colors"
                    onClick={() => handleDownload(course.pdfUrl, course.title)}
                    disabled={!course.pdfUrl}
                  >
                    <Download className="h-4 w-4 transition-all" />
                    Download
                  </Button>
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full rounded-sm"
                  />

                  <div className="flex w-full flex-wrap items-start gap-4">
                    <div className="flex flex-1 flex-col gap-1">
                      <h4 className="text-lg font-bold capitalize text-Black_light">
                        {course.title}
                      </h4>
                      <p className="text-sm font-medium text-paragraph">
                        {course.description}
                      </p>
                    </div>

                    <div className="flex flex-col items-center rounded-lg bg-primary_blue px-[15.6px] py-2">
                      <div className="text-sm font-semibold uppercase text-white">
                        {course.badgeText}
                      </div>
                      <div className="text-xs font-medium text-white">Status</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col items-center gap-3 pt-2">
            <div className="text-sm text-paragraph">
              Showing {mappedCards.length} of {totalItems} certificates
            </div>
            {totalPages > 1 ? (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        if (currentPage > 1) {
                          setCurrentPage((prev) => prev - 1);
                        }
                      }}
                      className={
                        currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>

                  {visiblePages.map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={page === currentPage}
                        onClick={(event) => {
                          event.preventDefault();
                          setCurrentPage(page);
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        if (currentPage < totalPages) {
                          setCurrentPage((prev) => prev + 1);
                        }
                      }}
                      className={
                        currentPage >= totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            ) : null}
          </div>
        </>
      ) : (
        <div className="text-sm text-paragraph">No certificates found.</div>
      )}
    </div>
  );
};

export default CertificatesPDUs;
