import { useState, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import CustomTable from "@/components/common/CustomTable";
import axiosInstance from "@/helper/axiosInstance";

interface IConfiguration {
  id: number;
  configKey: string;
  name: string;
  value: string;
  valueType: 'string' | 'number' | 'boolean' | 'json' | 'date';
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const ConfiguredValues = () => {
  const [configurations, setConfigurations] = useState<IConfiguration[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/configurations");
      setConfigurations(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch configurations:", error);
      setConfigurations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const handleEdit = (config: IConfiguration) => {
    setEditingId(config.id);
    setEditValue(config.value);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleSave = async (configId: number) => {
    try {
      setSaving(true);
      await axiosInstance.put(`/configurations/${configId}`, {
        value: editValue
      });

      setConfigurations(prev =>
        prev.map(config =>
          config.id === configId
            ? { ...config, value: editValue }
            : config
        )
      );

      toast.success("Configuration updated successfully!");
      setEditingId(null);
      setEditValue("");
    } catch (error) {
      console.error("Failed to update configuration:", error);
      toast.error("Failed to update configuration");
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (config: IConfiguration) => {
    switch (config.valueType) {
      case 'number':
        return (
          <Input
            type="number"
            value={editValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const val = e.target.value;
              if (val === '' || (Number(val) >= 0 && Number(val) <= 100)) {
                setEditValue(val);
              }
            }}
            className="h-8 text-sm"
            disabled={saving}
            min={0}
            max={100}
          />
        );
      case 'boolean':
        return (
          <Select
            value={editValue}
            onValueChange={(value) => setEditValue(value)}
            disabled={saving}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        );
      case 'date':
        return (
          <Input
            type="date"
            value={editValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value)}
            className="h-8 text-sm"
            disabled={saving}
          />
        );
      default:
        return (
          <Input
            type="text"
            value={editValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value)}
            className="h-8 text-sm"
            disabled={saving}
          />
        );
    }
  };

  return (
    <Card className="border-neutral-200 shadow-sm rounded-lg overflow-hidden py-0 gap-0">
      <Accordion type="single" collapsible defaultValue="configured-values">
        <AccordionItem value="configured-values">
          <AccordionTrigger className="border-b border-line bg-white px-6 py-4 hover:no-underline">
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-base font-semibold text-neutral-800">
                Configured Values
              </CardTitle>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="p-0 bg-white">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-line">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-8 w-8" />
                    </div>
                  ))}
                </div>
              ) : configurations.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No configurations found
                </div>
              ) : (
                <CustomTable
                  headers={[
                    {
                      key: "configuration",
                      header: "Configuration",
                      render: (row: IConfiguration) => (
                        <div>
                          <span className="text-neutral-700 font-medium">{row.name}</span>
                          {row.description && (
                            <p className="text-xs text-gray-500 mt-1">{row.description}</p>
                          )}
                        </div>
                      ),
                    },
                    {
                      key: "value",
                      header: "Value",
                      render: (row: IConfiguration) => (
                        editingId === row.id ? (
                          <div className="max-w-xs">
                            {renderInput(row)}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {row.value}%
                          </span>
                        )
                      ),
                    },
                    {
                      key: "action",
                      header: "Actions",
                      className: "text-right w-[100px]",
                      render: (row: IConfiguration) => (
                        <div className="flex items-center justify-end gap-2">
                          {editingId === row.id ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="px-3 py-1 text-green-600 hover:bg-green-50"
                                onClick={() => handleSave(row.id)}
                                disabled={saving}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="px-3 py-1 text-red-600 hover:bg-red-50"
                                onClick={handleCancel}
                                disabled={saving}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="px-3 py-1"
                              onClick={() => handleEdit(row)}
                            >
                              <Pencil className="h-4 w-4 text-neutral-500" />
                            </Button>
                          )}
                        </div>
                      ),
                    },
                  ]}
                  listData={configurations}
                  notFoundText="No configurations found."
                />
              )}
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
