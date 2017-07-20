# frozen_string_literal: true

# app/serializers/chronicle_serializer.rb
class QcCharmSerializer < ActiveModel::Serializer
  attributes :id, :qc_id, :name, :cost, :timing, :duration, :keywords, :min_essence, :body, :ref, :category
end