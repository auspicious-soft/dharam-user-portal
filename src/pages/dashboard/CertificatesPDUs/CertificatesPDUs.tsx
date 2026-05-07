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
};

type CertificatesResponse = {
  data?: CertificateItem[];
};

const CertificatesPDUs: React.FC = () => {
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const buildAssetUrl = (path?: string | null) => {
    const value = String(path ?? "").trim();
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value;

    try {
      const base = String(import.meta.env.VITE_API_BASE_URL ?? window.location.origin);
      const parsed = new URL(base, window.location.origin);
      return `${parsed.origin}/${value.replace(/^\/+/, "")}`;
    } catch {
      return `/${value.replace(/^\/+/, "")}`;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchCertificates = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/user/certificates", {
          params: { search: "" },
        });
        if (isMounted) {
          const payload = (response.data as CertificatesResponse)?.data ?? [];
          setCertificates(Array.isArray(payload) ? payload : []);
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
  }, []);

  const mappedCards = useMemo(
    () =>
      certificates.map((item, index) => {
        const imageUrl = buildAssetUrl(item.certificatePng);
        const pdfUrl = buildAssetUrl(item.certificatePdf);
        const moduleLabel = String(item.moduleType ?? "certificate")
          .replace(/[-_]/g, " ")
          .trim();

        return {
          id: item._id || String(index),
          image: imageUrl || LoginBanner,
          title: moduleLabel ? `${moduleLabel} Certificate` : "Certificate",
          description:
            item.status?.toUpperCase() === "ISSUED"
              ? "Certificate Issued"
              : "Certificate Pending",
          badgeText: item.status ?? "-",
          pdfUrl,
        };
      }),
    [certificates],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-4 items-center ">
        <h2 className="justify-start text-2xl font-bold ">My Certificates</h2>
      </div>

      <div className="flex justify-between items-center flex-wrap gap-3 mt-3">
        <Select>
          <SelectTrigger className="max-w-72 py-[11px]">
            <SelectValue placeholder="Select A Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Category1">Category 1</SelectItem>
            <SelectItem value="Category2">Category 2</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-1 md:gap-3 items-center">
          <TableSearch />
        </div>
      </div>

      {isLoading ? (
        <div className="text-sm text-paragraph">Loading certificates...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mappedCards.map((course) => {
            return (
              <div
                key={course.id}
                className="p-3 pb-5 rounded-lg inline-flex flex-col justify-start items-start gap-5 relative bg-[#DBE8FB]"
              >
                <Button
                  className="transition-colors max-h-[38px] !px-4 absolute top-5 right-5"
                  onClick={() => {
                    if (!course.pdfUrl) return;
                    window.open(course.pdfUrl, "_blank", "noopener,noreferrer");
                  }}
                  disabled={!course.pdfUrl}
                >
                  <Download className="w-4 h-4 transition-all " />
                  Download
                </Button>
                <img
                  src={course.image}
                  alt="Courses"
                  className="w-full rounded-sm"
                />

                <div className="flex flex-wrap items-start gap-4 w-full">
                  <div className="flex flex-col gap-1 flex-1">
                    <h4 className="text-Black_light text-lg font-bold capitalize">
                      {course.title}
                    </h4>
                    <p className="text-paragraph text-sm font-medium">
                      {course.description}
                    </p>
                  </div>

                  <div className="px-[15.6px] py-2 bg-primary_blue rounded-lg flex flex-col items-center">
                    <div className="text-white text-sm font-semibold uppercase">
                      {course.badgeText}
                    </div>
                    <div className="text-white text-xs font-medium">Status</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CertificatesPDUs;
