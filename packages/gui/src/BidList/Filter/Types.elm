module BidList.Filter.Types exposing (..)

import Dict

import BidList.Filter.Instance.Types as InstanceTypes

type alias FilterID = Int
type alias FilterDict = Dict.Dict FilterID InstanceTypes.Model

type alias Model =
    { filters : FilterDict
    , filterOrder : List FilterID
    , selected : SelectedFilter
    , currencies : Filter
    }

type Msg
    = ToInstance FilterID InstanceTypes.Msg
    | SetCurrencies (List String) (List String)
    | SelectFilter SelectedFilter
    | NewFilter

type SelectedFilter
    = NoFilter
    | FilterWithID FilterID

type alias Filter = InstanceTypes.Filter


getFilter : Model -> Filter
getFilter model =
    case model.selected of
        FilterWithID filterID ->
            case Dict.get filterID model.filters of
                Just filter ->
                    InstanceTypes.getFilter filter

                Nothing ->
                    noFilter model

        NoFilter ->
            noFilter model


noFilter : Model -> Filter
noFilter = .currencies
