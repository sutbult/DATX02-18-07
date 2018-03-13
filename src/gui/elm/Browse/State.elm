module Browse.State exposing (init, update, subscriptions)

import Browse.Types exposing (..)
import Browse.Bids.Types exposing (Value, Bid)
import Browse.Bids.State as BidsState
import Browse.Filter.State as FilterState
import Browse.Filter.Types
import Browse.Filter.Part.Types

import Platform.Cmd
import Browse.Rest exposing (getBids)

init : (Model, Cmd Msg)
init =
    let
        bids = []
        filterElements = getFilterElements bids
        (bidsModel, bidsCmd) = BidsState.init bids
        (filterModel, filterCmd) = FilterState.init filterElements
    in
        (   { bids = bidsModel
            , filter = filterModel
            }
        , Cmd.batch
            [ Platform.Cmd.map Bids bidsCmd
            , Platform.Cmd.map Filter filterCmd
            , getBids
            ]
        )

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        Filter subMsg ->
            let
                (subModel, subCmd) = FilterState.update subMsg (.filter model)
            in
                ({model | filter = subModel}, Platform.Cmd.map Filter subCmd)

        Bids subMsg ->
            let
                (subModel, subCmd) = BidsState.update subMsg (.bids model)
            in
                ({model | bids = subModel}, Platform.Cmd.map Bids subCmd)

        SetBids bids ->
            foldMsg update model
                [ Bids <| Browse.Bids.Types.SetBids bids
                , Filter
                    <| Browse.Filter.Types.From
                    <| Browse.Filter.Part.Types.SetCurrencies
                    <| filterElementsPart .from bids
                , Filter
                    <| Browse.Filter.Types.To
                    <| Browse.Filter.Part.Types.SetCurrencies
                    <| filterElementsPart .to bids
                ]

subscriptions : Model -> Sub Msg
subscriptions model = Sub.none

getFilterElements : List Bid -> (List String, List String)
getFilterElements bid =
    ( filterElementsPart .from bid
    , filterElementsPart .to bid
    )

filterElementsPart : (Bid -> Value) -> List Bid -> List String
filterElementsPart access =
    nub << List.map (.currency << access)

nub : List a -> List a
nub list =
    case list of
        [] ->
            []

        x :: xs ->
            if List.member x xs then
                nub xs
            else
                x :: nub xs

foldMsg : (msg -> model -> (model, Cmd msg)) -> model -> List msg -> (model, Cmd msg)
foldMsg fn model = List.foldl (updateCmd fn) (model, Cmd.none)

updateCmd
    :  (msg -> model -> (model, Cmd msg))
    -> msg
    -> (model, Cmd msg)
    -> (model, Cmd msg)

updateCmd fn msg (model, cmd) =
    let
        (nmodel, ncmd) = fn msg model
    in
        nmodel ! [cmd, ncmd]
