import React, { useState, useEffect } from "react";
import { Modal, Input, Select, Radio, Button } from "antd";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import useApi from "../redux/hooks/useApi";

const { Option } = Select;

// Define the interface for the onAdd function
interface AddListProps {
  onAdd: () => void;
  list_id?: number; // Optional list_id prop
}

const listSchema = yup.object().shape({
  name: yup.string().required("List name is required"),
  description: yup.string().required("Description is required"),
  status: yup.string().required("Status is required"),
});

const AddList: React.FC<AddListProps> = ({ onAdd, list_id }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(listSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "",
    },
  });
  const onSuccessGetList = async (response: any) => {
    const list = response?.data?.list;
    reset({
      name: list?.name,
      description: list?.description,
      status: list?.status,
    });
  };

  const onFailureGetList = (error: any) => {
    toast.error(error.response.data.detail);
  };

  const { isloading: isloadingGetList, callFetch: callFetchGetList } = useApi({
    onSuccess: onSuccessGetList,
    onFailure: onFailureGetList,
    header: "application/json",
  });

  const handleEdit = (id: any) => {
    handleOpenModal();
    callFetchGetList("get", `get-list?list_id=${list_id}`);
  };

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    reset();
  };

  const onSuccessAdd = async (response: any) => {
    toast.success(response?.data[0]?.message);
    handleCloseModal();
    onAdd();
  };

  const onFailureAdd = (error: any) => {
    toast.error(error.response.data.detail);
  };

  const { isloading: isloadingAdd, callFetch: callFetchAdd } = useApi({
    onSuccess: onSuccessAdd,
    onFailure: onFailureAdd,
    header: "application/json",
  });

  const handleFormSubmit = (data: any) => {
    console.log(data);
    callFetchAdd(
      list_id ? "patch" : "post",
      list_id ? `update-list?list_id=${list_id}` : "insert-list",
      data
    );

    // Handle add functionality
  };

  return (
    <>
      <div className="">
        <button
          className={`btn ${
            list_id ? "btn-outline-success btn-sm " : "btn-primary"
          }`}
          onClick={() => (list_id ? handleEdit(list_id) : handleOpenModal())}
        >
          {list_id ? "Edit List" : "Add New List"}
        </button>
      </div>
      <Modal
        maskClosable={false}
        title={
          <span className="fs-bolder fs-3 my-4">
            {list_id ? "Edit List" : "Add New List"}
          </span>
        }
        visible={isModalVisible}
        onCancel={handleCloseModal}
        footer={
          <div className="d-flex justify-content-center gap-2 mt-4 mb-2">
            <button
              key="cancel"
              className="btn btn-outline-danger"
              onClick={handleCloseModal}
            >
              Cancel
            </button>
            <button
              key="submit"
              type="submit"
              disabled={isloadingAdd}
              onClick={handleSubmit(handleFormSubmit)}
              className={`btn ${
                list_id ? "btn-outline-primary" : "btn-primary"
              }`}
            >
              {isloadingAdd ? "Saving..." : list_id ? "Save Changes" : "Add"}
            </button>
          </div>
        }
      >
        <form className=" d-flex flex-column gap-3">
          <div className="form-group">
            <label className="me-2 fw-bold fs-6" htmlFor="name">
              List Name:
            </label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <>
                  <Input {...field} id="name" placeholder="List Name" />
                  {errors.name && (
                    <span className="text-danger">{errors.name.message}</span>
                  )}
                </>
              )}
            />
          </div>
          <div className="form-group">
            <label className="me-2 fw-bold fs-6" htmlFor="description">
              Description:
            </label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <>
                  <Input.TextArea
                    {...field}
                    id="description"
                    placeholder="Description"
                    autoSize={{ minRows: 2, maxRows: 6 }}
                  />
                  {errors.description && (
                    <span className="text-danger">
                      {errors.description.message}
                    </span>
                  )}
                </>
              )}
            />
          </div>
          <div className="form-group d-flex align-items-center row col-12">
            <label className="me-2 fw-bold fs-6" htmlFor="status">
              Status:
            </label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <>
                  <Radio.Group
                    {...field}
                    optionType="button"
                    buttonStyle="solid"
                    className=""
                  >
                    <Radio value="active">Active</Radio>
                    <Radio value="inactive">Inactive</Radio>
                    <Radio value="pending">Pending</Radio>
                  </Radio.Group>
                  {errors.status && (
                    <span className="text-danger">{errors.status.message}</span>
                  )}
                </>
              )}
            />
          </div>
        </form>
        <hr />
      </Modal>
    </>
  );
};

export default AddList;
