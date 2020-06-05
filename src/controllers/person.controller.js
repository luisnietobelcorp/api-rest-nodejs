/**
 * person.controller.js
 * Responsable por recibir las solicitudes http desde el router person.route.js
 */
const PersonRepository = require('../repositories/person.repository')
const repository = new PersonRepository()

module.exports = class PersonController {
  /**
   *
   * @param {object} ctx: contexto de koa que contiene los parameteros de la solicitud, en este caso
   * desde el url de donde sacaremos el valor del parametro index (ctx.params.index)
   */
  async getByIndex(ctx) {
    const index = ctx.params.index && !isNaN(ctx.params.index) ? parseInt(ctx.params.index) : 0
    if (index > 0) {
      const filter = { index: index }
      const data = await repository.findOne(filter)
      if (data) {
        ctx.body = data
      } else {
        ctx.throw(404, `No se ha encontrado la persona con el indice ${index}`)
      }
    } else {
      ctx.throw(422, `Valor ${ctx.params.index} no soportado`)
    }
  }

  async getByParameters(ctx) {
    const requestFilter = ctx.request.body.filter || {}
    const requestOptions = ctx.request.body.options || {}
    const filter = {}
    const options = {}

    if (requestFilter.index != null && Array.isArray(requestFilter.index)) {
      filter.index = { $in: requestFilter.index }
    }
    if (requestFilter.age != null) {
      filter.age = {}
      if (requestFilter.age.gt != null) {
        filter.age.$gt = requestFilter.age.gt
      }
      if (requestFilter.age.lt != null) {
        filter.age.$lt = requestFilter.age.lt
      }
    }
    if (requestFilter.name != null) {
      filter.name = new RegExp(requestFilter.name)
    }
    if (requestFilter.countries != null && Array.isArray(requestFilter.countries)) {
      filter.countries = { $in: requestFilter.countries }
    }
    if (requestFilter.genders != null && Array.isArray(requestFilter.genders)) {
      filter.gender = { $in: requestFilter.genders }
    }

    if (requestOptions.page != null) {
      options.page = parseInt(requestOptions.page)
    }
    if (requestOptions.limit != null) {
      options.limit = parseInt(requestOptions.limit)
    }

    // const data = await repository.find(filter)
    const data = await repository.paginate(filter, options)
    if (data) {
      ctx.body = data
    } else {
      ctx.throw(404, `No se ha encontrado resultados para la busquedaa`)
    }
  }

  /**
   *
   * @param {object} ctx: contexto de koa que contiene los parameteros de la solicitud, en este caso desde el body,
   * obtendremos las propiedades de la persona a guardar a traves de ctx.request.body
   */
  async save(ctx) {
    const person = ctx.request.body
    await repository.save(person, true)
    ctx.body = person
  }
}
