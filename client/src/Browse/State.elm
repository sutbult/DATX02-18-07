module Browse.State exposing (init, update, subscriptions)

import Browse.Types exposing (..)
import Browse.Bids.Types exposing (Value, Bid)
import Browse.Bids.State as BidsState
import Browse.Filter.State as FilterState

import Platform.Cmd

init : Model
init =
    let
        bids =
            [ Bid (Value "Bitcoin" 0.01) (Value "Ethereum" 0.1)
            , Bid (Value "Ethereum" 0.5) (Value "Monero" 5)
            , Bid (Value "Bitcoin" 0.02) (Value "Monero" 2)
            ]
        filterElements = getFilterElements bids
    in
        { bids = BidsState.init bids
        , filter = FilterState.init filterElements
        }

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

subscriptions : Model -> Sub Msg
subscriptions model = Sub.none

getFilterElements : List Bid -> (List String, List String)
getFilterElements bid =
    let
        part access =
            nub << List.map (.currency << access)
    in
        ( part .from bid
        , part .to bid
        )

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
