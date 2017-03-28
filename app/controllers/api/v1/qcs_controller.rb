class Api::V1::QcsController < Api::V1::BaseController
  def show
    respond_with Qc.find(params[:id])
  end

  def create
    render json: Qc.create(qc_params).as_json
  end

  def destroy
    respond_with Qc.destroy(params[:id])
  end

  def update
    qc = Qc.find(params["id"])
    qc.update_attributes(qc_params)
    respond_with qc, json: qc
  end

  private

  def qc_params
    params.require(:qc).permit!
  end
end
