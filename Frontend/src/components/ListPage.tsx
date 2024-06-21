import React, { useCallback, useEffect, useState } from "react";
import AddList from "./AddList";
import { Divider, Dropdown, Menu, Modal, Spin, Table } from "antd";
import { toast } from "react-toastify";
import useApi from "../redux/hooks/useApi";
import { DownOutlined } from "@ant-design/icons";
import { debounce } from "lodash";

interface Pagination {
  current: number;
  pageSize: number;
  total?: number; // Make total optional initially
}

const ListPage = () => {
  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    pageSize: 10,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");
  const onSuccessDelete = async (response: any) => {
    toast.success(response?.data?.message);
    callFetchLists(
      "get",
      `get-all-lists?page=${pagination.current}&page_size=${pagination.pageSize}`
    );
  };

  const onFailureDelete = (error: any) => {
    toast.error(error.response.data.detail);
  };

  const { isloading: isloadingDelete, callFetch: callFetchDelete } = useApi({
    onSuccess: onSuccessDelete,
    onFailure: onFailureDelete,
    header: "application/json",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  useEffect(() => {
    fetchLists();
  }, [pagination.current, pagination.pageSize, searchTerm, statusFilter]);

  const handleAddList = () => {
    fetchLists();
  };

  const fetchLists = useCallback(() => {
    let url = `get-all-lists?page=${pagination.current}&page_size=${pagination.pageSize}`;
    if (searchTerm) {
      url += `&search=${searchTerm}`;
    }
    // Check if statusFilter is not empty and is an array
    if (statusFilter && statusFilter.length > 0) {
      // Convert statusFilter array to a comma-separated string
      const statusParams = statusFilter.join(",");
      url += `&statuses=${statusParams}`;
    }
    callFetchLists("get", url);
  }, [pagination.current, pagination.pageSize, searchTerm, statusFilter]);

  const handleEdit = (id: any) => {
    console.log("Edit ID:", id);
  };

  const columns = [
    {
      title: "Index",
      dataIndex: "index",
      key: "index",
      render: (text: any, record: any, index: number) => {
        // Calculate the index based on the sorted order of the data by 'id'
        return dataSource.findIndex((item: any) => item.id === record.id) + 1;
      },
    },

    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",

      filters: [
        {
          text: "Pending",
          value: "pending",
        },
        {
          text: "Active",
          value: "active",
        },
        {
          text: "Inactive",
          value: "inactive",
        },
      ],
      // onFilter: (value: any, record: any) => {
      //   // return record.status.indexOf(value as string) === 0;
      //   callFetchLists(
      //     "get",
      //     `get-all-lists?page=${pagination.current}&page_size=${pagination.pageSize}&status=${value}`
      //   );
      //   return;
      // },
      render: (status: string, record: any) => {
        let clname = "";
        switch (status) {
          case "active":
            clname = "text-bg-success";
            break;
          case "inactive":
            clname = "text-bg-danger";
            break;
          case "pending":
            clname = "text-bg-warning";
            break;
          default:
            clname = "text-bg-dark";
            break;
        }
        return (
          <span className={`badge p-2 ${clname}`} key={record?.id}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Action",
      key: "action",
      render: (index: any, record: any) => {
        // console.log(record.id); // Print the record to the console for debugging
        return (
          <div className="d-flex gap-2" key={index}>
            <AddList onAdd={handleAddList} list_id={record?.id} />
            <button
              className="btn btn-outline-danger btn-sm"
              disabled={isloadingDelete}
              onClick={() =>
                callFetchDelete("delete", `delete-list?list_id=${record?.id}`)
              }
            >
              Delete
            </button>
          </div>
        );
      },
    },
  ];

  const onSuccessLists = async (response: any) => {
    const lists = response?.data?.lists || [];
    const sortedData = lists.sort((a: any, b: any) => b.id - a.id);
    setDataSource(sortedData);
    setPagination({
      ...pagination,
      total: response.data.total_count, // Set total count, default to 0 if null or undefined
    });
  };

  const onFailureLists = (error: any) => {
    toast.error(error.response.data.detail);
  };

  const handleTableChange = (pagination: any, filters: any) => {
    setPagination(pagination);
    console.log("aaa", pagination);
    if (filters.status) {
      setStatusFilter(filters.status);
    } else {
      setStatusFilter([]);
    }
  };
  const { isloading: isloadingLists, callFetch: callFetchLists } = useApi({
    onSuccess: onSuccessLists,
    onFailure: onFailureLists,
    header: "application/json",
  });

  const onSuccessExport = async (response: any) => {
    // Assume the response contains a file URL
    // console.log(response);
    const fileURL = response?.data?.file_path;
    setDownloadLink(fileURL);
    setIsModalVisible(true);
  };

  const onFailureExport = (error: any) => {
    toast.error(error.response.data.detail);
  };

  const { isloading: isloadingExport, callFetch: callFetchExport } = useApi({
    onSuccess: onSuccessExport,
    onFailure: onFailureExport,
    header: "application/json",
  });
  const handleExport = (type: string) => {
    callFetchExport("get", `export-all-lists?format=${type}`);
  };
  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
    }, 300),
    []
  );

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(event.target.value);
  };

  return (
    <div className="">
      {isloadingExport ? <Spin fullscreen size="large" /> : ""}
      <div className="d-flex row align-items-center mb-4 w-100">
        <div className="col-lg-6  col-md-4">
          <h1>Listing Page</h1>
        </div>
        <div className="ms-auto d-flex gap-3 row col-md-8 col-lg-6">
          <div className="col-lg-4 col-md-5">
            <input
              type="text"
              className="form-control-sm"
              placeholder="Name / Description"
              onChange={handleSearch}
            />
          </div>
          <div className="dropdown col-lg-2 col-md-2">
            <button
              className="btn btn-primary dropdown-toggle"
              type="button"
              id="dropdownMenuButton"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Export
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
              <li>
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={() => handleExport("csv")}
                >
                  Export as CSV
                </a>
              </li>
              <li>
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={() => handleExport("excel")}
                >
                  Export as Excel
                </a>
              </li>
            </ul>
          </div>
          <AddList onAdd={handleAddList} className="col-lg-3 col-md-4" />
        </div>
        {/* <div className="ms-auto d-flex gap-3 col-md-5 col-lg-4">
          <div className="dropdown">
            <button
              className="btn btn-primary dropdown-toggle"
              type="button"
              id="dropdownMenuButton"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Export
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
              <li>
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={() => handleExport("csv")}
                >
                  Export as CSV
                </a>
              </li>
              <li>
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={() => handleExport("excel")}
                >
                  Export as Excel
                </a>
              </li>
            </ul>
          </div>
          <AddList onAdd={handleAddList} />
        </div> */}
      </div>
      <Table
        style={{
          backgroundColor: "#D8DCE0",
          // width: "100%",
          borderRadius: "8px",
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
        }}
        bordered
        scroll={{ x: "true" }}
        size="small"
        className="p-2"
        dataSource={dataSource}
        columns={columns}
        showSorterTooltip={{ target: "sorter-icon" }}
        rowKey="id"
        pagination={{
          ...pagination,
          total: pagination.total,
          position: ["bottomCenter"],
        }}
        loading={isloadingLists}
        onChange={handleTableChange}
      />
      <Modal
        title="Download Exported File"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        maskClosable={false}
        footer={
          isloadingExport ? (
            ""
          ) : (
            <div className="d-flex gap-3 align-items-center justify-content-center">
              <button
                type="button"
                className="btn btn-outline-primary fw-bold"
                onClick={handleCancel}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary fw-bold"
                onClick={handleOk}
              >
                <a href={downloadLink} download>
                  <span className="text-white"> Download</span>
                </a>
              </button>
            </div>
          )
        }
      >
        {isloadingExport ? (
          ""
        ) : (
          <p>
            Your export is ready. You can save the file by clicking on Download
            button.
          </p>
        )}

        {/* <a href={downloadLink} download>
          Download Excel File
        </a> */}
      </Modal>
    </div>
  );
};

export default ListPage;
